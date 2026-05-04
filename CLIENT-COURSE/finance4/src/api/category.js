import app from './axios.js'

export const categoryApi = {
    index: () => app.get('categories')
}