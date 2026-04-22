import app from "./axios";


export const apiPost = {
    create:(data) => app.post('/posts', data, {
        headers:{
            "Content-Type":"multipart/form-data"
        }
    }),
    delete: (id) => app.delete("/posts/"+id),
    get: (params = {}) => {
        console.log({params})
        const {page, size} = params;
        return app.get('/posts', {
            params:{
                page:page,
                size:size
            }
        })
    }

}