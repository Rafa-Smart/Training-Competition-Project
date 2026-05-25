const get = (url, params = {}) => {
    const url = new URL(`http://localhost:8000/${url}`);
    Object.entries(params).forEach(([key, value]) => {
        if(key != undefined && value != undefined ) {
            url.searchParams.set(key, value)
        }
        return fetch(url).then((data) => data.json())
    })
}


export const api ={
    getPosts:(params) => get('api/v1/posts'),
    getPost:(slug) => get('api/v1/posts/'+slug),
    getCategories:() => get('api/v1/categories')
}