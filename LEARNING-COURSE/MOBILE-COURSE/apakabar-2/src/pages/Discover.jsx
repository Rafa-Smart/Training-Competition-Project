import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import useDebounce from "../hooks/useDebounce";
import useBookmarks from "../hooks/useBookmarks";
import ArticleItem from "../components/ArticleItem";

const Discover = ({onClickArticle}) => {
    // const [loading, setLoading] = useState(false);
    // const [categories, setCategories] = useState([]);
    // const [activeCategory, setActiveCategory] = useState([]);
    // const [query, setQuery] = useState('');
    // const debounce = useDebounce(query, 700);
    // const [bookmarks, toggle, isBookmark] = useBookmarks();
    // const observeRef = useRef();


    // // infinite scroll
    // const [posts, setPosts] = useState([]);
    // const [page, setPage] = useState(1);
    // const [hasMore, setHasMore] = useState(true);

    // // bikin toggle untuk peilihan catgory
    // // disni yang ktia kirim adalah data string caegorynya ya, bukan objek cateory
    // // akanya kita bisa apke langusngincludes
    // const toggleCategory = (category) => {
    //     setActiveCategory((prev) => {
    //         if(prev.includes(category)){
    //             return prev.filter(c => c!= category)
    //         }else {
    //             return [...prev, category]
    //         }
    //     } )
    // }

    // // nah disni ktia akan selalu mengupdate data category yang di pilih untk emnjadi category param yang akan di kirim ke server
    // // karena server itu mintanya adlah string pake , jaidkita join aja dulu

    // const categoryparameter = activeCategory && activeCategory.join(',');

    // // nah sebelum kita harus reset dulu setiap ada yang baru ya
    // useEffect(() => {
    //     setPosts([]);
    //     setPage(1);
    //     setHasMore(true);
    // }, [categoryparameter, debounce])

    // // nah ini untuk inifintescrollnya ya pake observe

    // useEffect(() => {
    //     if(loading) return;
    //     if(!hasMore) return;    
    //     setLoading(true);
    //     api.getPosts({
    //         page:page,
    //         per_page:10,
    //         category: categoryparameter,
    //         search: debounce
    //     }).then((response => {
    //         const data = response.data || [];
    //         setPost(prev => page == 1 ? data : [...prev, ...data]);
    //         setHasMore(data.length > 0); 
    //     })).finnaly(() => setLoading(false))
    // }, [debounce, categoryparameter, page])


    // // nah dinsi baru kita akan buat observeya 
    // // https://chatgpt.com/c/6a0fbeac-6210-83ec-a2d7-7c3a14978d72
    // const observe = useCallback((node) => {
    //     if(loading) return;
    //     if(observeRef.current) observeRef.current.disconnect();
    //     observeRef.current = new IntercetionObserver((entries) => {
    //         if(entries[0].isIntersecting && hasMore && !loading){
    //             setPage(prev => prev + 1);
    //         }
    //     }, {rootMargin: '200px'})
    //     if(node) observeRef.current.observe(node);
    // },[loading, hasMore])

    // useEffect(() => {
    //     api.getCategories().then(response => setCategories(response.data||[]));
    // }, [])


    const [categories, setCategories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [activeCategory, setActiveCategory] = useState([]);
    const [query, setQuery]= useState('');
    const debounce = useDebounce(query, 700);
    const [bookmarks, toggle, isBookmark] = useBookmarks();
    const categoryParameter = activeCategory && activeCategory.join(',');
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasmore] = useState(true);
    const [page, setPage] = useState(1);

    const observeRef = useRef();
   
console.log(activeCategory);
console.log(categoryParameter);

    const toggleCategory = (category) => {
        setActiveCategory(prev => {
            if(prev.includes(category)){
                return prev.filter(c => c != category)
            }else {
                return [...prev, category]
            }
        })
    }

    useEffect(() => {
        setPosts([]);
        setPage(1);
        setHasmore(true);

    }, [categoryParameter, debounce])

    useEffect(() => {
        if(!hasMore)return;if(loading)return;
        setLoading(true);
        api.getPosts({
            page:page,
            per_page:10,
            search:debounce,
            category: categoryParameter
        }).then(response => {
            const data = response.data || [];
            setPosts(prev => page==1 ? data : [...prev, ...data]);
            setHasmore(data.length > 0);
        }).finally(() => setLoading(false))
    }, [debounce, categoryParameter, page])

    const observe = useCallback((node) => {
        if(!hasMore)return;if(loading)return;
        if(observeRef.current)observeRef.current.disconnect();
        observeRef.current = new IntersectionObserver(entries => {
            if(entries[0].isIntersecting && hasMore && !loading){
                setPage(prev => prev + 1);
            }
        }, {rootMargin: '200px'});
        if(node) observeRef.current.observe(node)
    }, [hasMore, loading])

    useEffect(() => {
        api.getCategories().then(response => setCategories(response.data||[]));
    }, [])


    return <div className='page'>
        <div className='search'>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}></input>
        </div>
        <div className='discover-category hide-scrollbar'>
            <div className={`discover-category-item ${activeCategory.length <= 0 ?'active':''}`} onClick={() => setActiveCategory([])}>All</div>
            {
                categories.map((category, index) => {
                    return <div key={index} className={`discover-category-item ${activeCategory.includes(category.slug) ? 'active':''}`} onClick={() => toggleCategory(category.slug)}>{category.name}</div>
                })
            }
            </div>
        <div className='discover-scroll hide-scrollbar'>
            {
              posts.map((article, index) => {
                    return <ArticleItem article={article} isBookmark={isBookmark} onBookmark={toggle} onClickItem={onClickArticle} key={index}></ArticleItem>
                })
            }
            {/* ini untuk observeny ya */}
            <div className='observe' ref={observe}> 
            {loading && <span className='loading center'></span>}
            {!hasMore && posts.length > 0 && <p className="end-msg">All caught up ✓</p>}
            </div>
        </div>
    </div>
}

export default Discover;