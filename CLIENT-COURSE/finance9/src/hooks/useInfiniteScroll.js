import { useCallback, useState } from "react"
import { transactionApi } from "../api/transaction";

const useInfiniteScroll = (params ={}) => {
    const [transactions, setTransactions] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [loading, setLoading]  = useState(false);
    // console.log(transactions)
    const load = useCallback( async(pageNumber, reset=false) => {
        setLoading(true)
        try {
            const response = await transactionApi.get({
                ...params,
                page:pageNumber,
                per_page:25
            });
            const data = response.data[0]
            // console.log(data.data)
            if(reset){
                setTransactions(data.data);
            }else {
                setTransactions((prev) => [...prev, ...data.data ]);
            }
            setHasMore(data.current_page < data.last_page);
            setPage(data.current_page);
        }catch(e){
            
            alert(e)
        }finally{
            setLoading(false)
        }
    }, [JSON.stringify(params)]);

    const loadMore = () => {
        if(!loading && hasMore){
            load(page+1, false)
        }
    };

    const reload = () => {
        setTransactions([]);
        setPage(1);
        setHasMore(true);
        load(1, true);
    }

    return [transactions, page, loading, hasMore, loadMore, reload]
}

export {useInfiniteScroll}