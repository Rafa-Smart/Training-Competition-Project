import app from './axios.js';
export const currencyApi = {
    index: () => app.get('currencies')
}