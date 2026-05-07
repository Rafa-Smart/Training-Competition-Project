import { app } from "./axios";

export const transactionApi = {
  index: (param = {}) => app.get("transactions", { params }),
  store: (data) => app.post("transactions", data),
  destroy: (transactionId) => app.post("transactions/" + transactionId),
  transfer: async (data) => {
    await transactionApi.store({
      walelt_id: data.form_wallet_id,
      category_id: data.form_category_id,
      note: data.from_note,
      amount: data.amount,
      date: data.date,
    });
    await transactionApi.store({
      walelt_id: data.to_wallet_id,
      category_id: data.to_category_id,
      note: data.to_note,
      amount: data.amount,
      date: data.date,
    });
  },
};
