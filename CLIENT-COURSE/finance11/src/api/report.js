import app from "./axios";

const reportApi = {
    expense:() => app.get('reports/summary-by-category/expense'),
    income:() => app.get('reports/summary-by-category/income'),
}
export {
    reportApi
}

