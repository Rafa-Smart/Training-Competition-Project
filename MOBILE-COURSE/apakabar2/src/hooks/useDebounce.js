import { useEffect, useState } from "react"

const useDebounce = (value, delay = 700) => {
    const [debounced, setDebounced] =useState(value);
    useEffect(() => {
        const time = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(time);    
    }, [value, delay]);
    return debounced;
}
export default useDebounce