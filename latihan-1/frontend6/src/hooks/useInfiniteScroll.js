import { useCallback, useState } from "react";

export const useInFiniteScroll = (
  fetchFunction,
  size = 10,
  initialPage = 0,
) => {
  const [size, setSize] = useState(size);
  const [page, setPage] = useState(initialPage);
    const [errors, setErrors] = useState({})
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [hasMore, setHashMore] = useState(true);

  const [posts, setPosts] = useState([]);

  const loadMore = useCallback( async()=>{

    // jadi stop kalo loaidng dna ga ada data lagi
    if(isLoadingPosts || !hasMore){
        return ;
    }

    setIsLoadingPosts(true);
    setHashMore(true)

    try{
        const response = await fetchFunction(size, page);

        if(response.length == 0){
            hasMore(false)
        }else {
            setPosts((posts) => [...posts, ...response])
            setPage((page) => page + 1)
        }
    }catch(e){
        setErrors(e || {})
            setHashMore(false)
    }finally{
        setIsLoadingPosts(false)
    }

  },     [isLoadingPosts, posts, hasMore, page, fetchFunction])


  useEffect(() => {
    const handleScroll = () => {
        const cekScroll = window.innerHeight + window.scrollY >= document.body.offsetHeight -100;

        if(cekScroll){
            loadMore()
        }

    }
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore,hasMore, isLoadingPosts])


  const reset = () => {
    setPosts([]);
    setErrors({});
    setHashMore(false);
    setIsLoadingPosts(false);
    setPage(initialPage)
  }

  return {posts, isLoadingPosts, reset, hasMore, errors}
};
