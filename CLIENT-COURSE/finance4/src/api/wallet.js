import app from "./axios.js";

export const walletApi = {
  index: () => app.get("wallets"),
  store: (data) => app.post("wallets", data),
  put: (walletId) => app.put("wallets/" + walletId),
  delete: (walletId) => app.delete("wallets/" + walletId),
  show: (walletId) => app.get("wallets/" + walletId),
};
