import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (fetchData, initialPage = 0, pageSize = 10) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchData(page, pageSize);
      const newData = response.data.posts || response.data;
      
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData(prev => page === 0 ? newData : [...prev, ...newData]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchData, pageSize]);

  const refresh = useCallback(async () => {
    setPage(0);
    setData([]);
    setHasMore(true);
    await loadMore();
  }, [loadMore]);

  useEffect(() => {
    refresh();
  }, []);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
  };
};