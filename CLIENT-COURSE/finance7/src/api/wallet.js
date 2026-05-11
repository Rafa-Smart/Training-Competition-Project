import { app } from "./axios";

export const walletApi = {
  index: () => app.get("wallets"),
  create: (data) => app.post("wallets/", data),
  update: (data) => app.put("wallets/", data),
  show: (walletId) => app.get("wallets/" + walletId),
  destroy: (walletId) => app.delete("wallets/" + walletId),
};
