import { useCallback, useState } from "react";
import { transactionApi } from "../api/transaction";

export default useInfinite = (params = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetch = useCallback(
    async (pageNumber, reset = false) => {
      setLoading(true);
      try {
        const response = await transactionApi.index({
          ...params,
          page: pageNumber,
          per_page: 25,
        });
        const data = response.data;

        if (reset) {
          setTransactions(data.data);
        } else {
          setTransactions((prev) => [...prev, data.data]);
        }

        if (data.current_page < data.last_page) {
          setHasMore(false);
        }
        setPage(data.current_page);
      } catch (e) {
        alert("gagal dapetin data");
      } finally {
        setLoading(false);
      }
    },
    [JSON.stringify(params)],
  );

  const loadMore = () => {
    if (!loading && hasMore) {
      // kita ambahin 1 biar fetch data terur yang terbaru
      fetch(page + 1, false);
    }
  };

  const reload = () => {
    fetch(1, true);
    setTransactions([]);
    setPage(1);
    setHasMore(true);
  };

  return [page, hasMore, transactions, loading, loadMore, fetch, reload];
};
