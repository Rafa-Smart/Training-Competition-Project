import { app } from "./axios";

export const transactionApi = {
    store: (data) => app.post('/transactions', data),
    delete: (id) => app.post('/transactions/'+id),
    index: (params = {}) => app.post('/transactions', {params}), // ingat ya bukan daata jadi haurs pake {}
    transferMoney:async (data) => {
        await app.post('/transactions', {
            wallet_id:data.from_wallet_id,
            category_id:data.from_category_id,
            amount:data.amount, // sama aja kan ini
            date:data.date, // sama aja ka ini mah
            note:data.from_note
        });
        await app.post('/transactions', {
            wallet_id:data.to_wallet_id,
            category_id:to_category_id,
            amount:data.amount,
            date:data.date,
            note:to_note
        })
    }
}