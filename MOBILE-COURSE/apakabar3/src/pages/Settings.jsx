import { useEffect, useState } from "react";
import { api } from "../api/api";
const key = 'apakabar_categories'
const Settings = ({theme, setTheme}) => {

    const [categories, setCategories] = useState([]);
    useEffect(() => {
        api.getCategories().then(response => {
            setCategories(response.data);
        })
    }, []) 

    const toggleCategory = (category) => {
        setCategories(prev => {
            const next = prev.includes(category) ? prev.filter(c => c!=category):[...prev, category];
            localStorage.setItem(key, JSON.stringify(prev));
            return next
        })
    };



    return <div className='page'>
        <section ></section>
    </div>
}

export default Settings;