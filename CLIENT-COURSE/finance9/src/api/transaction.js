import { app } from "./axios"

const transactionApi = {
    get:(params={}) => app.get('transactions', {params}),
    create:(data) => app.post('transactions', data),
    delete:(transactionId) => app.delete('transactions/'+transactionId),
    transfer:async(data) => {
        await app.post('transactions', {
            wallet_id:data.to_wallet_id,
            category_id:data.to_category_id,
            amount:data.to_amount,
            date:data.date,
            note:data.to_note || '',
            amount:data.amount
        })
         await app.post('transactions', {
            wallet_id:data.from_wallet_id,
            category_id:data.from_category_id,
            amount:data.from_amount,
            date:data.date,
            note:data.from_note || '',amount:data.amount
        })
    }
}


export {transactionApi}