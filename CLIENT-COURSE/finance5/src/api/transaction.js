import { app } from "./axios";

export const transactionApi = {
  index: (params = {}) => app.get("transactions"),
  store: (data) => app.post("transactions"),
  destroy: (transactionId) => app.delete("transactions/" + transactionId),
  tranfer: async (data) => {
    await transactionApi.store({
      wallet_id: data.from_wallet_id,
      category_id: data.from_category_id,
      note: data.from_note,
      amount: data.amount,
      date: data.date,
    });
    await transactionApi.store({
      wallet_id: data.to_wallet_id,
      category_id: data.to_category_id,
      note: data.to_note,
      amount: data.amount,
      date: data.date,
    });
  },
};
