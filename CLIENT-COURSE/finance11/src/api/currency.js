import app from "./axios";

const currencyApi = {
    index:() => app.get('currencies')
}

export {
    currencyApi
}