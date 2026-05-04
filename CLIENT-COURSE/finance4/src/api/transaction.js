import { app } from "./axios";

export const transactionApi = {
  index: (params) => app.get("transactions", { params }),
  store: (data) => app.post("transaction", data),
  delete: (transactionId) => app.delete("transaction/" + transactionId),
  transfer: async (form) => {
    await transactionApi.store({
      wallet_id: form.from_wallet_id,
      category_id: form.from_category_id,
      amount: form.amount,
      date: form.date,
      note: form.from_note_id ||'',
    });
    await transactionApi.store({
      wallet_id: form.to_wallet_id,
      category_id: form.to_category_id,
      amount: form.amount,
      date: form.date,
      note: form.to_note_id ||'',
    });
  },
};
