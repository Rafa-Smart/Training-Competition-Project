import { useCallback, useState } from "react";
import { transactionApi } from "../api/transaction";

export default useInifine = ({ params = {} }) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    (pageNumber, reset = false) => {
      setLoading(true);
      transactionApi
        .index({ ...params, page: pageNumber, per_page: 25 })
        .then((res) => {
          if (reset) {
            setTransactions(res.data.data);
          } else {
            setTransactions((prev) => [...prev, res.data.data]);
          }
          if (res.data.last_page <= res.data.current_page) {
            setHasMore(false);
          }
          setPage(res.data.current_page);
        })
        .catch((e) => alert("err", e))
        .finally(() => {
          setLoading(false);
        });
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
    setHasMore(false);
    setPage(1);
    setLoading(false);
  };
  return [transactions, page, hasMore, loading, fetchData, reset, loadMore];
};
