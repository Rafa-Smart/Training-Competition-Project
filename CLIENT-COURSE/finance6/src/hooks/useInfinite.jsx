import { useCallback, useState } from "react";
import { transactionApi } from "../api/transaction";

export const useInfinite = (params = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchTransaction = useCallback((pageNumber, reset=false) => {
    try {
        const data = await transactionApi.index({...params, page:pageNumber,per_page:25})
        

        if(reset){
            setTransactions(data.data.data);
        }else {
            setTransactions((prev) => [...prev, data.data.data]);
        }

        if(data.data.current_page < data.data.last_page){
            setHasMore(false);
        }
        setPage(data.data.current_page)
    }catch(e){
        alert('gagal amibl data', e)
    }finally{
        setLoading(false)
    }
  }, [JSON.stringify(params)]);

  const loadMore = () => {
    if(!loading && hasMore){
        fetchTransaction(page+1,false)
    }
  }

  const reload = () => {
      setTransactions([])
    fetchTransaction(1, true);
    hasMore(true)
    page(1);
  }
  return [loadMore, loading, hasMore, page, fetchTransaction,transactions, reload]
};
