import { app } from "./axios";

export const reportApi = {
  getExpenseSumary: (params = {}) =>
    app.get("/reports/summary-by-category/expense", { params }),
  getIncomeSumary: (params = {}) =>
    app.get("/reports/summary-by-category/income", { params }),
};
