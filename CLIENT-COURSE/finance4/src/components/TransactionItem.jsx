import { transactionApi } from "../api/transaction";
import { walletApi } from "../api/wallet";

export default TransactionItem = ({showDate, transaction, onDelete}) => {
    const isEspense = transaction.category.type == 'EXPENSE'
    const handleDbClick = async (e) => {
        const confirmed = window.confirm('apakah kamu mau hapus transaksi ini ?')
        if(!confirmed){
            return ;
        }
        try {
            await transactionApi.delete(transaction.id);
            onDelete()
        }catch(e){
            alert('gagal hapus transaksi')
        }
    }

    return <>  

    {/* anah dinsi kita kan tampilin date (kalo boleh) */}
    {
        showDate && <div>{formatDate(transaction.date)}</div>
    }

    <div onDoubleClick={handleDbClick} className="cursor-pointer flex lg:items-center justify-between border-b border-slate-700 py-3 lg:py-4 gap-3 text-lg">
  <div className="flex lg:items-center gap-3">
    <div className={`aspect-[1/1] h-[40px] flex items-center justify-center border-2 ${isEspense ?'bg-red-200 border-red-300' : 'bg-green-200 border-green-300'} rounded-full`}>
      {transaction.category.icon}
    </div>
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
        <div className="font-medium">
          {transaction.category?.name}
        </div>
        <div className="text-slate-400 text-sm lg:text-[1rem]">
          {transaction.wallet?.name}
        </div>
      </div>
      <div className="text-slate-400 text-xs lg:text-sm">{transaction.note}</div>
    </div>
  </div>
  <div className="amount font-medium">
    {formatCurrency(transaction.amount, transaction.wallet?.currency_code)}
  </div>
</div>
</>
}