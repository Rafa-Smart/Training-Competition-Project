import { useCallback, useEffect, useRef, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import useBookmark from "../hooks/useBookmark";
import { api } from "../api/api";
import ArticleCard from "../components/ArticleCard";

const Discover = ({ onArticleClick }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCateories] = useState([]);

  const [query, setQuery] = useState();
  const [activeCategories, setActiveCategories] = useState([]);

  const search = useDebounce(query, 700);
  const [page, setPage] = useState(1);
  const [hasMore, setHasmore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toggle, isBookmark] = useBookmark()
  const observeRef = useRef();

    const toggleCategory = (slug) => {
        setCateories(prev => {
            // ingat ya disiniitu prev bukan satu objek, tapi selruh isi rraynya ya
            prev.includes(slug) ? prev.filter(c => c!= slug):[...prev, slug]
        })
    }
    const categoryParam = activeCategories.length?activeCategories.join(','):undefined
    useEffect(() => {
        setPosts([]);
        setHasmore(true);
        setPage(1)
    }, [search, categoryParam])
    useEffect(() => {
        if(!hasMore)return;
        setLoading(true);
        api.getPosts({
            page:page, per_page:10, search:search, category:categoryParam
        }).then((response) => {
            const data = response.data || [];
            setPosts(prev => page ===1 ?data: [...prev, data]);
            setHasmore(data.meta.current_page <= data.meta.last_page)
        }).finally(() => setLoading(false))
    }, [page, categoryParam, search])

    const observe = useCallback((node) => {
        if(observeRef.current)observeRef.current.disconnect();
        observeRef.current= new IntersectionObserver(entries => {
            if(entries[0].isIntersecting && !loading && hasMore){
                setPage(page => page +1);
            }
        }, {rootMargin:'200px'});

        if(node) observeRef.current.observe(node);
    }, [hasMore, loading]);

    useEffect(() => {
        api.getCategories().then(response => setCateories(response.data ||[]))
    }, [])

    return (
        <div className="page">
            <input className='search-input' type="search" value={query} onChange={(e) => setQuery(e.target.value)}></input>
            <div className='category-filter'>
            {/* jadi ini tuh all aka aktif kalo misalkan engga ada yang di pilih categoryya */}
                <button className={`category-btn ${activeCategories.length == 0 ? 'active':''}`}
                onClick={() => setActiveCategories([])}
                >All</button>

                {/* ini  utuk yg cateogry */}
                {
                    categories.map((category, index) => {
                        <button key={index} className={`category-btn ${activeCategories.includes(category.slug) ?'active':''}`}
                        onClick={() =>toggleCategory(category.slug)}>{category.name}</button>
                    })
                }
                {
                    activeCategories.lwngth >0&& <p className="active-filter-label">
                        Filter: {activeCategories.join(', ')}
                        <button className="clear-filter" onClick={() => setActiveCategories([])}>X Clear</button>
                    </p>
                }
                {
                    posts.map((post, index) => {
                        return <ArticleCard article={post.slug} isBookmarked={isBookmark(post.slug)} onBookmark={toggle} key={index} onClickBookmark={onArticleClick}></ArticleCard>
                    })
                }
                {
                    <div ref={observe} className="sentinal">
                        {loading && <span className='loader center'></span>}
                        {!hasMore  && posts.length > 0 && <p className='end-msg'>All Caugth Up </p>}
                    </div>
                }
            </div>
        </div>
    )
};
export default Discover