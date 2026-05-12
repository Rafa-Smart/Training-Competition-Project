import { app } from "./axios";

export const walletApi = {
  index: () => app.get("wallets"),
  store: (data) => app.post("wallets/", data),
  update: (walletId,data) => app.put("wallets/"+ walletId, data),
  show: (walletId) => app.get("wallets/" + walletId),
  destroy: (walletId) => app.delete("wallets/" + walletId),
};
