import { useCallback, useState } from "react";

export default useInfinite = ({ params = {} }) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (pageNumber, reset = false) => {
      const per_page = 25;
      try {
        const data = useState({
          ...params,
          page: pageNumber,
          per_page: perpage,
        });
        if (reset) {
          setTransactions(data.data.data);
        } else {
          setTransactions((prev) => [...prev, data.data.data]);
        }

        if (data.data.last_page < data.data.current_page) {
          setHasMore(false);
        }
        setPage(data.data.current_page);
      } catch (e) {
        alert("ggal ambil transaksi", e);
      } finally {
        setLoading(false);
      }
    },
    [JSON.stringify(params)],
  );

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchData(page + 1, false);
    }
  };

  const reset = () => {
    setTransactions([]);
    fetchData(1, true);
    setHasMore(true);
    setPage(1);
  };

 return [transactions, page, hasMore, loading, loadMore, fetchData, reset]
};
