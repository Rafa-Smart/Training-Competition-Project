import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import TransactionItem from "../components/TransactionItem";
import { walletApi } from "../api/wallet";
import AddWalletModal from "../components/AddWalletModal";
import AddTransactionModal from "../components/AddTransactionModal";

export default Home = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddTransaction, setShowTrnsaction] = useState(false);
  const { transactions, loadMore, loading, reload, page, hasMore, fetchData } =
    useInfiniteScroll();

  const loadwallets = async () => {
    const data = await walletApi.index();

    setWallets(data.data.wallets);
  };

  useEffect(() => {
    loadwallets();
    fetchData(1, true);
  }, []);

  const handleDataChange = (e) => {
    reload();
    loadWallets();
  };

  const shouldShowDate = (index) => {
    if (index == 0) return true;
    return transactions[index] !== transactions[index - 1];
  };

  return (
    <>
      {" "}
      <main class="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h2 class="text-2xl font-semibold">Hi {user.name}👋</h2>
            <p class="text-sm text-slate-400 mt-0.5">
              Let’s check where your money’s going and growing.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <a href="" class="btn" onClick={() => setShowTrnsaction(true)}>
              Add Transaction
            </a>
          </div>
        </div>

        <div class="-mb-3">
          <h3 class="text-xl font-medium mb-3">Balance</h3>
          {wallets.map((wallet, index) => {
            <div class="flex flex-nowrap overflow-x-auto gap-3 lg:gap-4 pb-3 lg:pb-5">
              <a
                onClick={() => setShowAddWallet(true)}
                class="border border-slate-700 p-5 rounded-xl flex items-center justify-center aspect-[5/2] text-4xl font-light hover:bg-slate-800"
              >
                +
              </a>
              <Link
                to={"wallets/" + wallet.id}
                class="p-5 border border-slate-700 rounded-xl inline-block pe-12 whitespace-nowrap hover:bg-slate-800"
              >
                <div class="font-medium text-slate-400 mb-1.5">
                  {wallet.name}
                </div>
                <div class="font-semibold amount line-clamp-1 text-2xl lg:text-3xl">
                  {formatCurrency(wallet.balance, wallet.currency_code)}
                </div>
              </Link>
            </div>;
          })}
        </div>

        <div class="w-full max-w-[700px]">
          <h3 class="text-xl font-medium">Recent Transactions</h3>

          {transactions.map((tran) => {
            return (
              <TransactionItem
                onDelete={handleDataChange}
                showDate={() => shouldShowDate(index)}
                transaction={tran}
              ></TransactionItem>
            );
          })}

          {loading && <div className="text-center">Loading...</div>}
          {!loading && transactions.length === 0 && (
            <div>dat transaksi belum ada</div>
          )}
          {hasMore && !loading && <button onClick={loadMore}>LoadMore</button>}
        </div>

        <AddWalletModal isOpen={showAddWallet} onClose={() => setShowAddWallet(false)}
            onSuccess={handleDataChange}
        ></AddWalletModal>

        <AddTransactionModal isOpen={showAddTransaction} onClose={() => setShowTrnsaction(false)} onSuccess={handleDataChange}></AddTransactionModal>
      </main>
    </>
  );
};
