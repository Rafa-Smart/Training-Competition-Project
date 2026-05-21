const baseAPI = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const get = (path, params ={}) => {
    const url = new URL(`${baseApi}/${path}`);
    // jadi gini kan dari params itu dia adaalh objek ya dan objek itu ada key dan values kan maka inidi sebut entries
    // nah kita au ubha dari objek ke array pake entries, kalo kealkannya itu kita bisa pake fromEntries maka ini ubha dari array ke objek
    Object.entries(params).forEach(([key, value]) => {
        if(key != undefined && value != '' || value != undefined){
            url.searchParams.set(key, value)
        }
        return fetch(url).then(data => data.json());
    })
}
const api = {
    getPosts:(params) => get('api/v1/posts',params),
    getPost:(slug) => get(`api/v1/posts/${slug}`),
    getCategories:() => get(`api/v1/categories`)
}