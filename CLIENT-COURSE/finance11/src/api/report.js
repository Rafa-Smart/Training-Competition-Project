import app from "./axios";

const reportApi = {
    expense:(params) => app.get('reports/summary-by-category/expense', params),
    income:(params) => app.get('reports/summary-by-category/income', {params}),
}
export {
    reportApi
}
