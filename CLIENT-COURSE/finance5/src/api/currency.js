import { app } from "./axios";


export const currencyApi = {
    index:() => app.get('currencies')
}