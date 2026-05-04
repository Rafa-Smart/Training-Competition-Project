import { use, useCallback, useState } from "react";
import { transactionApi } from "../api/transaction";

export default useInfiniteScroll = (params = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (pageNumber, reset = false) => {
      setLoading(true);
      try {
        const data = await transactionApi.index();
        if (reset) {
          setTransactions(data.data.data); // di tumpuk aj dan jadi ulang dari awal
        } else {
          setTransactions((prev) => [...prev, data.data.data]);
          // /di tambah aja
        }

        if (data.data.current_page > data.data.last_page) {
          setHasMore(false);
        }
        setPage((prev) => prev + page);
      } catch (e) {
        console.log("error");
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

  const reload = () => {
    setTransactions([]);
    setHasMore(true);
    setPage(1);
    fetchData(1, true);
  };

  return {reload, hasMore, page, transactions, loadMore, fetchData}
};
