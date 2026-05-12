import { transactionApi } from "../api/transaction";
import { formatCurrency, formatDate } from "../utils/format";

export default TransactionItem = ({ transaction, onDelete, showDate }) => {
  const isExpense = (transaction.category.type = "EXPENSE");
  const handleDelete = async () => {
    const confirmed = confirm("apus?");
    if (confirmed) {
      try {
        await transactionApi.destroy(transaction.id);
        onDelete();
      } catch (e) {
        alert("gagal hapus");
      }
    }
  };
  return (
    <>
    {showDate && <>{formatDate(transaction.date)}</>}
      <div
        className="cursor-pointer flex lg:items-center justify-between border-b border-slate-700 py-3 lg:py-4 gap-3 text-lg"
        onDoubleClick={handleDelete}
      >
        <div className="flex lg:items-center gap-3">
          <div
            className={`aspect-[1/1] h-[40px] flex items-center justify-center ${isExpense ? "bg-red-200  border-red-300" : "bg-green-200  border-green-300"} rounded-full border-2`}
          >
            {transaction.category.icon}
          </div>
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
              <div className="font-medium">{transaction.category.name}</div>
              <div className="text-slate-400 text-sm lg:text-[1rem]">
                {transaction.wallet.name}
              </div>
            </div>
            <div className="text-slate-400 text-xs lg:text-sm">
              {transaction.note}
            </div>
          </div>
        </div>
        <div className="amount font-medium">
          {isExpense ? "-" : "+"}{" "}
          {formatCurrency(transaction.amount, transaction.wallet.currency_code)}
        </div>
      </div>
    </>
  );
};
