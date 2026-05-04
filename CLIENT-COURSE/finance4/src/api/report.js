import { app } from "./axios";

export const reportApi = {
  getExpense: (params) => app.get("reports/summary-by-category/expense", {params}),
  getIncome: (params) => app.get('reports/summary-by-category/income')
};
