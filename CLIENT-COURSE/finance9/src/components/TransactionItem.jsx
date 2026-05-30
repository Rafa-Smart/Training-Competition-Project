import { transactionApi } from "../api/transaction";
import { formatCurrency, formatDate } from "../utils/format";

const TransactionItem = ({transaction, showDate, onDelete}) => {
    const isExpense=transaction.category.type== 'EXPENSE';
    const handleDelete = (e) => {
        const confirmed = window.confirm('apus nih ?');
        if(!confirmed)return;
        try{
            transactionApi.delete(transaction.id)
            onDelete();
        }catch(e){
            alert('gagal apus')
        }
    }


    return <>

        {
            showDate && <>{formatDate(transaction.date)}</>
        }
            <div class="cursor-pointer flex lg:items-center justify-between border-b border-slate-700 py-3 lg:py-4 gap-3 text-lg" onDoubleClick={handleDelete}>
                <div class="flex lg:items-center gap-3">
                    <div class={`aspect-[1/1] h-[40px] flex items-center   border-2 justify-center ${isExpense ? ' bg-red-200 border-red-300':' bg-green-200 border-green-300'} rounded-full`}>
                        {transaction?.category?.icon}
                    </div>
                    <div>
                        <div class="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                            <div class="font-medium">
                               {transaction?.category?.name}
                            </div>
                            <div class="text-slate-400 text-sm lg:text-[1rem]">
                               {transaction?.wallet?.name}
                            </div>
                        </div>
                        <div class="text-slate-400 text-xs lg:text-sm">
                            {transaction?.note}
                        </div>
                    </div>
                </div>
                <div class="amount font-medium">
                    {isExpense ? '-':'+'} {formatCurrency(transaction?.amount, transaction?.wallet?.currency_code)}
                </div>
            </div>

    </>
}