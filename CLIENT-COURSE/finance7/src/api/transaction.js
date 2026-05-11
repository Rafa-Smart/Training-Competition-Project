import { app } from "./axios";

export const transactionApi = {
  index: () => app.get("transactions"),
  create: (data) => app.post("transactions/", data),
  destroy: (transactionId) => app.delete("transactions/" + transactionId),
};
