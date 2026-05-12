import { app } from "./axios";

export const transactionApi = {
  index: () => app.get("transactions"),
  store: (data) => app.post("transactions/", data),
  destroy: (transactionId) => app.delete("transactions/" + transactionId),
  transfer: async (data) => {
    await transactionApi.store({
      from_wallet_id: data.from_wallet_id,
      from_category_id: data.from_category_id,
      from_note: data.from_note,
      amount: data.amount,
      date: data.date,
    });
    await transactionApi.store({
      from_wallet_id: data.to_wallet_id,
      from_category_id: data.to_category_id,
      from_note: data.to_note,
      amount: data.amount,
      date: data.date,
    });
  },
};
