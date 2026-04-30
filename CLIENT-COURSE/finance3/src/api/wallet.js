import { app } from "./axios";


export const walletApi = {
    store: (data) => app.post('/wallets', data),
    update: (data) => app.put('/wallets', data),
    delete: (id) => app.post('/wallets/'+id),
    index: () => app.get('/wallets'),
    show:(id) => app.get('/wallets/'+id)
}