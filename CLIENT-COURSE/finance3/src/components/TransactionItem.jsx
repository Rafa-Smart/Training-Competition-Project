import { transactionApi } from "../api/transaction";
import { formatCurrency, formatDate } from "../utils/format";

export default TransactionItem = ({ transaction, onDelete, showDate }) => {
  const isExpense = transaction?.category?.type == "EXPENSE";

  //   nah disini tiu ketiak dia si itemnya di klik dua kali maka akan di hapus ya

  const handleDoubleClick = async () => {
    const confirmasi = window.confirm(
      `apakah mau delete transaksi ${transaction?.category?.name} sebesar ${transaction?.amount}?`,
    );
    if (!confirmasi) return;

    try {
      await transactionApi.delete();
      onDelete(); // disini ondelete itu adalah fungis untuk refresh yang ada di
      // dalam halaman yang memanggil si item transaksi ini
    } catch (e) {
      window.alert("gagal menghapus transaksi : " + e);
    }
  };

  // nanit si showDate ini itu di dapet dari halaman yang panggil si item transaksi ini ya
  // jadi kalo date item ini sama kaya yang sebelumnya maka gausha di tmapilkan

  return (
    <>
      {/* nih di sini kit atampilinnya si date (kalo di tampilin)*/}
      {showDate && (
        <div
          style={{
            color: "white",
            fontSize: "11px",
            fontWeight: "bold",
            padding: "3px",
          }}
        >
          {/* //   kita pake format ya untuk nampilinya */}
          {formatDate(transaction?.date)}
        </div>
      )}

      <div className="cursor-pointer flex lg:items-center justify-between border-b border-slate-700 py-3 lg:py-4 gap-3 text-lg">
        <div className="flex lg:items-center gap-3">
          <div
            className={`aspect-[1/1] h-[40px] flex items-center justify-center bg-red-200 border-2 border-red-300 rounded-full // bsia juga gini ya
          `}
            style={
              isExpense
                ? { borderColor: "red", backgroundColor: "red" }
                : { borderColor: "green", backgroundColor: "green" }
            }
          >
            {/* nah dinsi si style dari divnya ya yang kita ganti/cek */}
            {transaction.category?.icon}
          </div>
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
              <div className="font-medium">{transaction.category?.name}</div>
              <div className="text-slate-400 text-sm lg:text-[1rem]">
                {transaction.wallet?.name}
              </div>
            </div>
            <div className="text-slate-400 text-xs lg:text-sm">
              {transaction?.note}
            </div>
          </div>
        </div>
        {/* disnijuga kit apake in dia format currency ya */}
        <div className="amount font-medium">{formatCurrency(transaction.amount, transaction.wallet?.currency_code)}</div>
      </div>
    </>
  );
};
