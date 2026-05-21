import { useEffect, useState } from "react"

export default useDebounce = (value, delay = 700) => {
    const [debounced, setDebounced] =useState(value);
    useEffect(() => {
        const time = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(time);    
    }, [value, delay]);
    return debounced;
}