import { useCallback, useState } from "react"
import { transactionApi } from "../api/transction";

const useInfiniteScroll = (params = {}) => {
    const [transactions, setTransactions] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false)
    
    const load = useCallback( async(pageNumber, reset=false) => {

        setLoading(true);

        try {
            const response = await transactionApi.index({
                ...params,
                page:pageNumber,
                per_page:5
            });

            const data = response.data[0];
            
            if(reset){
                setTransactions(data.data)
            }else {
                setTransactions(prev => [...prev, ...data.data])
            }

            setHasMore(data.current_page < data.last_page);
            setPage(data.current_page);
        }catch(e){
            console.log('error ambil data transksi')
            console.log(e);
        }finally{
            setLoading(false)
        }

    }, [JSON.stringify(params)])

    const loadMore = () => {
        if(!loading && hasMore){
            load(page+1, false);
        }
    }

    const reload = () => {
        setTransactions([]);
        setHasMore(true);
        setPage(1);
        load(1, true);
    }

    return [transactions, page, hasMore, loading, loadMore, reload];
}

export {
    useInfiniteScroll
}