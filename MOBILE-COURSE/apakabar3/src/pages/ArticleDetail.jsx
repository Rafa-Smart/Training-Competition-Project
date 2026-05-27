import { useEffect, useState } from "react";
import { api } from "../api/api";
import useBookmarks from "../hooks/useBookmarks";
import ArticleItem from "../components/ArticleItem";

const ArticleDetail = ({slug, onClickArticle}) =>{
    const [post, setPost] = useState();
    const [referensi, setReferensi] = useState([]);
    const [bookmarks, toggle, isBookmark] = useBookmarks();
    const [loading, setLoading] = useState(false)
    // console.log(slug)
    // console.log({post})
    // console.log({referensi})
  const date = post && new Date(post.published_at).toLocaleDateString("id-ID", { dateStyle: "long" });
    // jadi gini, ii tuh masalhnya karena bookmark nya masih pegang
    
    useEffect(() => {
             {/* NAH INI WAJIB BANGET KTIA KASIH KEY DISNI, KARENA GINI KETIAK KITA SET ARTICLE YA DARI SI DETAIL ARTICLE
          KA KALO KOMPONENNAY MASIH SAMA MAKA TIDAK AKAN DI RENDER, JADI DISNI KITA KA MAU BUKA DETIAL PAGE TAPI KITA UDHA DI DETAIL PAGE, MAKANYA OPEN ARTICLENYA ENGGA JAALN GITUU, MAKANYA DISNI KITA WAJIB PAKE KEY UNTUK PEMBEDA, JAID KALO AD ASETsTATE MAKA AKAN DI RELOAD LAGI KARENA KEYNYA BERBEDA */}
        setLoading(true);    
        setPost(null);
        setReferensi([]);
        // nah jadi gini slugnya itu wajib kita taruh dulu di vriable local ya
        // kareana, nanti kalo engga article yang saat ini akan masih ada di realated
        const currentSlug = slug;
        api.getPost(currentSlug).then((response) => {
            const data = response.data;
            const slug = data.category.slug;
            setPost(data);
            if(slug){
                // console.log('ini slug')
                api.getPosts({
                category: slug,
                per_page:10
            }).then((response) => {
                const data = (response.data || [])
                const filtered = data.filter(article => article.slug != currentSlug);
                const sliced = filtered.slice(0,3);
                setReferensi(sliced);
            }).finally(() => setLoading(false))
            }
            
        })
    },[])

    return<div className='page-detail hide-scrollbar'>
            {
                loading ? <span className='loading center'></span>: post && <div className='detail-article'>
                {post?.thumbnail && <img src={post.thumbnail} className='detail-img'></img>}
                <div className='article-detail-body'>
                    <div className='detail-category'>
                        <p>{post?.category.name}</p>
                        <div>
                            {
                            post?.tags && post.tags.map((tag, index) => {
                                return <span key={index} className='detail-tag'>#{tag.name}</span>
                            })
                        }
                        </div>
                    </div>
                    <div className='detail-date'>
                        <p>Author: {post.author_name}</p>
                        <p>{date}</p>
                        <p>Visited: {post.visited_count}</p>
                    </div>
                    <button onClick={() => toggle(post)} className={`btn-bookmark`}>{ isBookmark(post.slug) ? '🔖 bookmarked':"+ Bookmark"}</button>
                    
                    <h2 className='detail-title'>{post?.title}</h2>

                    <p className="detail-data">{ post.body}</p>
                </div>
                <div className='related'>
                    <h4>Related</h4>
                    <div className='related-scroll'>
                        {
                            referensi && referensi.map((article, index)=> {
                                return <ArticleItem article={article} isBookmark={isBookmark} onBookmark={toggle} onClickItem={onClickArticle} key={index}></ArticleItem>
                            })
                        }
                    </div>
                </div>
            </div>
            }
    </div>
}

export default ArticleDetail;