import { app } from "./axios";

export const transactionApi = {
  index: () => app.get("transactions"),
  store: (data) => app.post("transactions/", data),
  destroy: (transactionId) => app.delete("transactions/" + transactionId),
};
