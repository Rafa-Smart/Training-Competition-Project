import { app } from "./axios";

export const walletApi = {
    index:() => app.get('wallets'),
    show:(walletId) => app.get('wallets/'+walletId),
    store: (data) => app.post('wallets', data),
    put:(walletId, data) => app.put('wallets/'+walletId, data),
    destroy: (walletId) => app.delete('wallets/'+walletId)
}