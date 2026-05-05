import { app } from "./axios";

export const reportApi ={
    summaryExpense: (params={})=> app.get('reports/summary-by-category/expense', {params}),
    summaryIncome: (params = {}) => app.get('reports/summary-by-category/income')
}