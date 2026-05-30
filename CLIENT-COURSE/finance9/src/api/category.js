import { app } from "./axios";

const categoryApi = {
    get:() => app.get('categories')
}

export {categoryApi}