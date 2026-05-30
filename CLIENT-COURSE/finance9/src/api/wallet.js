import { app } from "./axios";

const walletApi = {
    get:() => app.get('wallets'),
    show:(walletId) => app.get('wallets/'+walletId),
    create:(data) => app.post('wallets', data),
    update:(data, walletId) => app.put('wallets/'+walletId, data),
    destroy:(walletId) => app.delete("wallets/"+walletId)
}

export {walletApi};