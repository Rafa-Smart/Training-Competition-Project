import { app } from "./axios";

export const reportApi = {
    expense:(params ={}) => app.get('expense'),
    income:(params ={}) => app.get('income')
}