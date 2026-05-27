import { useEffect, useState } from "react";
import { api } from "../api/api";

const ArticleDetail = ({slug, onClickArticle}) =>{
    const [post, setPost] = useState();
    const [referensi, setReferensi] = useState([]);
    // console.log(slug)
    // console.log({referensi})
    console.log({post})

    // jadi gini, ii tuh masalhnya karena bookmark nya masih pegang

    useEffect(() => {
        api.getPost(slug).then((response) => {
            const data = response.data;
            const slug = data.category.slug;
            setPost(data);
            if(slug){
                // console.log('ini slug')
                api.getPosts({
                category: slug,
                per_page:10
            }).then((response) => {
                const data = (response.data || []).filter((postData) => postData.slug != slug).slice(0,3);
                setReferensi(data);
            })
            }
            
        })
    },[])

    return<div>
        <h1>ini article ''</h1>
    </div>
}

export default ArticleDetail;