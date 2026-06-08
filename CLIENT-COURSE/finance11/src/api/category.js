import app from "./axios";

const categoryApi = {
    index:() => app.get('categories')
}

export {
    categoryApi
}