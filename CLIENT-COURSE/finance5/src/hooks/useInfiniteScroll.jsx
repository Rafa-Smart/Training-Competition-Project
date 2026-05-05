import { useCallback, useState } from "react";
import { transactionApi } from "../api/transaction";

export default useInfiniteScroll = (params = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasmore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchTransaction = useCallback(
    async (pageNumber, reset = false) => {
      setLoading(true);
      try {
        const data = await transactionApi.index({
          ...params,
          per_page: 25,
          page: page,
        });

        if (reset) {
          setTransactions(data.data.data);
        } else {
          setTransactions((prev) => [...prev, data.data.data]);
        }

        if (data.data.current_page < data.data.last_page) {
          setHasmore(false);
          setPage(data.data.current_page);
        }
      } catch (e) {
        alert("error ambil transaksi", e);
      } finally {
        setLoading(false);
      }
    },
    [JSON.stringify(params)],
  );


  const loadMore = () => {
    if(!loading && hasMore){
        fetchTransaction(page+1, false)
    }
  }

  const reload = () => {
    setTransactions([]);
    setPage(1);
    setHasmore(true);
    fetchTransaction(1, true)
  }


  return [transactions, loadMore, loading, hasMore, fetchTransaction, reload]
};
