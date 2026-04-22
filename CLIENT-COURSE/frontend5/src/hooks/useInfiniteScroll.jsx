import { useCallback, useEffect, useState } from "react";

export default useInfiniteScroll = (fetchPosts, size = 10, initialPage = 0) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(size);
  const [hasMore, setHasMore] = useState(true);
  const [errors, setErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    setErrors(null);

    try {
      const response = await fetchPosts(size, page);

      if (response.length != 0) {
        setPosts((posts) => [...posts, response]);
        setPage((page) => page + 1);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      setErrors(e);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPosts, size, hasMore, page, isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      const cekScroll =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;

      if (cekScroll) {
        loadMore;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return window.removeEventListener('scroll', handleScroll)
  }, [loadMore, isLoading, hasMore]);



  const reset = () => {
    setErrors({})
    setHasMore(false);
    setIsLoading(false);
    setPosts(false);
    loadMore();
  }

  return {
    posts, isLoading, hasMore, errors, reset
  }
};
