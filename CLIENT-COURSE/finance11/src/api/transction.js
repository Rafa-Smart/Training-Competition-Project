import app from "./axios";

const transactionApi = {
  index: (params = []) => app.get("transactions"),
  create: (data) => app.post("transactions/", data),
  delete:(id) => app.delete('transactions/'+id),
  transfer: async (data) => {
    await app.post("transactions", {
      wallet_id: data.from_wallet_id,
      category_id: data.from_category_id,
      amount: data.amount,
      note: data.from_note_id,
      date: data.date,
    });
    await app.post("transactions", {
      wallet_id: data.to_wallet_id,
      category_id: data.to_category_id,
      amount: data.amount,
      note: data.to_note_id,
      date: data.date,
    });
  },
};

export { transactionApi };
