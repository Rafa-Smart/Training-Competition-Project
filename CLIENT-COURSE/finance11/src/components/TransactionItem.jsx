import { transactionApi } from "../api/transction";
import { formatCurrency, formatDate } from "../utils/format";

const TransactionItem = ({transaction, onDelete, showDate}) => {
    const isExpense = trnsction?.category?.type == 'EXPENSE';

    const handleDelete =async() => {
        try {
            await transactionApi.delete(transaction.id);
            onDelete();
        }catch(e){
            alert('gagl hpus trnsaksi ')
        }
    }

    return <div className="cursor-pointer flex lg:items-center justify-between border-b border-slate-700 py-3 lg:py-4 gap-3 text-lg">
    {
        showDate && formatDate(transaction.date)
    }
                <div className="flex lg:items-center gap-3">
                    <div className="aspect-[1/1] h-[40px] flex items-center justify-center bg-red-200 border-2 border-red-300 rounded-full">
                        {transaction?.category.icon || ''}
                    </div>
                    <div>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                            <div className="font-medium">
                                {transaction?.category.name || ''}
                            </div>
                            <div className="text-slate-400 text-sm lg:text-[1rem]">
                                {transaction?.wallet.name ||''}
                            </div>
                        </div>
                        <div className="text-slate-400 text-xs lg:text-sm">{transaction.note || ''}</div>
                    </div>
                </div>
                <div className="amount font-medium">
                    {
                        formatCurrency(transaction?.wallet?.balance, transaction?.wallet.currency_code)
                    }
                </div>
            </div>
}

export default TransactionItem;