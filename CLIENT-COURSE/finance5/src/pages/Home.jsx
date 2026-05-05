import { useEffect, useState } from "react";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { walletApi } from "../api/wallet";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddWalletModal from "../components/AddWalletModal";

export default Home = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState();
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactions, loadMore, loading, hasMore, fetchTransaction, reload] =
    useInfiniteScroll({});

  const fetchWallets = async () => {
    const data = await walletApi.index();
    setWallets(data.data.data.wallets);
  };
  useEffect(async () => {
    fetchWallets();
  }, [showAddWallet]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.alyKey) {
        if (e.key === "w") {
          e.preventDefault();
          setShowAddWallet(true);
        }
        if (e.key === "n") {
          e.preventDefault();
          setShowAddTransaction(true);
        }
      }
      if (e.key === "Escape") {
        setShowAddWallet(false);
        setShowAddTransaction(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showDate = (index) => {
    if (index == 0) return true;
    return transactions[index] != transactions[index - 1];
  };

  const handleChangeData = () => {
    reload();
    fetchWallets();
  };

  return (
    <>
      <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h2 className="text-2xl font-semibold">Hi {user.name}👋</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Let’s check where your money’s going and growing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a onClick={() => setShowAddTransaction(true)} className="btn">
              Add Transaction
            </a>
          </div>
        </div>
        <div className="-mb-3">
          <h3 className="text-xl font-medium mb-3">Balance</h3>
          {wallets.map((wallet) => {
            return (
              <div className="flex flex-nowrap overflow-x-auto gap-3 lg:gap-4 pb-3 lg:pb-5">
                <a
                  onClick={() => setShowAddWallet(true)}
                  className="border border-slate-700 p-5 rounded-xl flex items-center justify-center aspect-[5/2] text-4xl font-light hover:bg-slate-800"
                >
                  +
                </a>
                <Link
                  to={"wallets/" + wallet.id}
                  className="p-5 border border-slate-700 rounded-xl inline-block pe-12 whitespace-nowrap hover:bg-slate-800"
                >
                  <div className="font-medium text-slate-400 mb-1.5">
                    {wallet.name}
                  </div>
                  <div className="font-semibold amount line-clamp-1 text-2xl lg:text-3xl">
                    {formatCurrency(wallet.balance, wallet.currency_code)}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
        <div className="w-full max-w-[700px]">
          <h3 className="text-xl font-medium">Recent Transactions</h3>
          {transactions.map((transaction, index) => {
            return (
              <TransactionItem
                onDelete={handleChangeData}
                key={index}
                transaction={transaction}
                showDate={() => showDate(index)}
              ></TransactionItem>
            );
          })}
        </div>
      </main>
      <AddWalletModal
        isOpen={showAddWallet}
        onClose={() => setShowAddWallet(false)}
        onSuccess={handleChangeData}
      ></AddWalletModal>
      
    </>
  );
};
