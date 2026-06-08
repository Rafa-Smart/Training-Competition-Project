import app from "./axios";

const walletApi = {
    index:() => app.get('wallets'),
    create:(data) => app.post('wallets/',data),
    show:(walletId) =>app.get('wallets/'+walletId),
    update:(walletId, data) => app.put('wallets/'+walletId,data),
    delete:(walletId) => app.delete('wallets')
}

export {
    walletApi
}