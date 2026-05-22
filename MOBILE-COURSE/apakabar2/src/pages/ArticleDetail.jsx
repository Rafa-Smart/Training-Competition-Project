import { useEffect, useState } from "react"
import useBookmark from "../hooks/useBookmark";
import { api } from "../api/api";
import ArticleCard from "../components/ArticleCard";

export default ArticleDetail = ({slug, onArticleClick}) => {
    const [post, setPost] = useState(null);
    const [related, setRelated] = useState([]);
    const [toggle, isBookmark] = useBookmark();

    useEffect(() => {
        setPost(null);
        api.getPost(slug).then((response) => {
            const data = response.data;
            setPost(data);
            if(data?.category?.slug){
                api.getPosts({
                    category:data?.category?.slug,
                    per_page:10,
                }).then((response) => {
                    setRelated((response.data||[])).filter(a => a.slug!= slug).slice(0,3)
                })
            }
        } )
    }, [slug])

    if(!post)return <div className="page"><span className="loader center"></span></div>
    const data = new Date(post.published_at).toLocaleDateString('id-ID', {dateStyle:'long'})

    return (
        <div className='page article'>
            {post.thumbnail && <img className="article-img" src={post.thumbnail} alt={post.title}></img>}
            <div className='article-body'>
                {post.category && <span className="card-category">{pos.category.name}</span>}
                <h1 className='article-title'>{post.title}</h1>
                <div className="article-meta">
                    <span>{post?.author?.name}</span>
                    <span>{date}</span>
                    <span>{post.visited_count?.toLocaleDateString()}</span>
                </div>
                <button className={`bm-full ${isBookmark(slug) ? 'bm-active':''}`}
                onClick={() => toggle(post)}
                aria-label="button bookmark"
                >{isBookmark(slug) ?'bookmarked':'+ bookmark'}</button>
                <div className='article-content' dangerouslySetInnerHTML={{__html:post.body}}></div>
                {
                    post.tags?.length > 0 && (<div className='tags'>
                        {post.tags.map((t, i) => <span key={i} className='tag'>#{t.name}</span>)}
                    </div>)
                }
                {
                    related.length > 0 && <section>
                        <h2 className='section-title'>Related</h2>
                        {
                            related.map(a => {
                                return <ArticleCard key={a.slug} article={a} isBookmarked={isBookmark(a.slug)} onBookmark={toggle} onClickBookmark={onArticleClick}></ArticleCard>
                            })
                        }
                    </section>
                }
            </div>
        </div>
    )

}