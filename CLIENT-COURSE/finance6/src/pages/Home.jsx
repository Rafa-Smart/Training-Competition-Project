import { useEffect, useState } from "react";
import { useInfinite } from "../hooks/useInfinite";
import { walletApi } from "../api/wallet";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddWalletModal from "../components/AddWalletModal";
import AddTransanctionModal from "../components/AddTransanctionModal";

export default Home = () => {
  const [showWallet, setShowWallet] = useState(false);
  const [showTransction, setShowTransaction] = useState(false);
  const [walets, setWallets] = useState([]);
  const [
    loading,
    transactions,
    loading,
    loadMore,
    hasMore,
    page,
    fetchTransactions,
    reload,
  ] = useInfinite({});
  const loadWalet = async () => {
    const data = await walletApi.index();
    setWallets(data.data.data);
  };
  useEffect(() => {
    loadWalet();
    fetchTransactions(1, false);
  }, []);

  const handleDataChange = () => {
    loadWalet();
    reload();
  };

  const showDate = (index) => {
    if (index <= 0) return true;
    return transactions[index].date != transactions[index - 1].date;
  };

  return (
    <>
      <main class="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h2 class="text-2xl font-semibold">Hi Budi👋</h2>
            <p class="text-sm text-slate-400 mt-0.5">
              Let’s check where your money’s going and growing.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <a href="" class="btn">
              Add Transaction
            </a>
          </div>
        </div>

        <div class="-mb-3">
          <h3 class="text-xl font-medium mb-3">Balance</h3>
          {walets.map((wallet) => {
            return (
              <div class="flex flex-nowrap overflow-x-auto gap-3 lg:gap-4 pb-3 lg:pb-5">
                <a
                  onClick={() => setShowWallet(true)}
                  class="border border-slate-700 p-5 rounded-xl flex items-center justify-center aspect-[5/2] text-4xl font-light hover:bg-slate-800"
                >
                  +
                </a>
                <Link
                  to={"/wallets/" + wallet.name}
                  class="p-5 border border-slate-700 rounded-xl inline-block pe-12 whitespace-nowrap hover:bg-slate-800"
                >
                  <div class="font-medium text-slate-400 mb-1.5">
                    {wallet.name}
                  </div>
                  <div class="font-semibold amount line-clamp-1 text-2xl lg:text-3xl">
                    {formatCurrency(wallet.balance, wallet.currency_code)}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div class="w-full max-w-[700px]">
          <h3 class="text-xl font-medium">Recent Transactions</h3>

          {transactions.map((transaction, index) => {
            return (
              <TransactionItem
                onDelete={handleDataChange}
                showDate={() => showDate(index)}
                transaction={transaction}
                key={index}
              ></TransactionItem>
            );
          })}
          {loading && hasMore && <>loadingg...</>}
          {!loading && hasMore && (
            <div onClick={() => loadMore()}>loadMore</div>
          )}
          {!loading && transactions.length == 0 && <div>ga ada transaksi</div>}
        </div>
        <AddWalletModal
          isOpen={showWallet}
          onClose={() => setShowWallet(false)}
          onSuccess={handleDataChange}
        ></AddWalletModal>
        <AddTransanctionModal
          isOpen={showTransction}
          onClose={() => setShowTransaction(false)}
          onSuccess={handleDataChange}
          defaultWalletId={null}
        ></AddTransanctionModal>
      </main>
    </>
  );
};
