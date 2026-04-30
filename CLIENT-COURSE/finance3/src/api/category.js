import { app } from "./axios";

export const categoryApi = {
    index: () => app.get('/categories')
}