import { useEffect, useState } from "react"
import useBookmark from "../hooks/useBookmark";
import { api } from "../api/api";
import ArticleDetail from "./ArticleDetail";
import ArticleCard from "../components/ArticleCard";
const KEY = 'prefs';
export default Home = ({onArticleClick}) => {
    const [breakings, setBreakings] = useState([]);
    const [recomendations, setRecomendations] = useState([]);
    const [toggle, isBookmark] = useBookmark();

    useEffect(() => {
        api.getPosts({
            per_page:5,
            order_by:'latest'
        }).then((data) => setBreakings(data.data || []));

        const prefs = JSON.parse(localStorage.getItem(KEY)) || [];
        if(!prefs)return;

        Promise.all(
            // ini ibasnya isinya array ya, tapi disini kita ke map aja
            prefs.map(slug => api.getPosts({
                per_page:3,// disin kta pake cuma 3 aja ya
                category:slug, 
                order_by:'latest'
            })).then((data) => data.data || [])
            // jadi ini kan akna menghaislakn array dalam array, makanya kita akna flat kan dulu
        ).then((data) => setRecomendations(data.flat()))
    }, []);
    return <div className="page">
        <section>
            <h2 className="section-title">Breaking News</h2>
            <div className="breaking-scroll">
                {
                    breakings.map((breaking, index) => {
                        <div className="breaking-card" key={index} onClick={onArticleClick}>
                            {breaking.thumbnail} && <img src={breaking.thumbnail} alt={breaking.name}></img>
                            <div className={'breaking-overlay'}>
                                {breaking.category && <span className="card-category">{breaking.category.name}</span>} 
                                <p>{breaking.title}</p>
                            </div>
                        </div>
                    })
                }
            </div>
        </section>
        <section>
            <h2 className="section-title">For You</h2>
            {
                prefs.length == 0 ? <p>kosong</p>:recomendations.map((recomendation, index) => {
                    return <ArticleCard article={recomendation} isBookmarked={isBookmark(recomendation.slug)} onBookmark={toggle}  onClickBookmark={onArticleClick} key={index} ></ArticleCard>
                }) 
            }
        </section>
    </div>
}