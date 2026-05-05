import { app } from "./axios";

export const transactionApi = {
  index: (params = {}) => app.get("transactions"),
  store: (data) => app.post("transactions"),
  destroy: (transactionId) => app.delete("transactions/" + transactionId),
};
