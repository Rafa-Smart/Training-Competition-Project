import { app } from "./axios";

const currencyApi = {
    get:() => app.get('currencies')
}

export {currencyApi}