import { app } from "./axios";

export const categoryApi = {
    get: () => app.get('categories')
}