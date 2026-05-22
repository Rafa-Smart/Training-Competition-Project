import { useEffect, useState } from "react"
import useBookmark from "../hooks/useBookmark";
import { api } from "../api/api";

export default Home = ({onArticleClick}) => {
    const [breaking, setBreaking] = useState([]);
    const [recomendations, setRekomendations] = useState([]);
    const [toggle, isBookmark] = useBookmark();

    useEffect(() => {
        api.getPosts({
            per_page:5,
            order_by:'latest'
        }).then((data) => setBreaking(data.data || []));

        const prefs = localStorage.getItem('prefs')
    }, [])
}