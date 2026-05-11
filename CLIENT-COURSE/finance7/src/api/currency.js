import { app } from "./axios";

export const currency = {
    index:() => app.get('currencies')
}