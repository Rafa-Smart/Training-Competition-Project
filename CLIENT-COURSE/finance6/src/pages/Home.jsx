import { useEffect, useState } from "react";
import useInfinite from "../hooks/useInfinite";
import { walletApi } from "../api/wallet";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddWalletModal from "../components/AddWalletModal";
import AddTransanctionModal from "../components/AddTransanctionModal";

export default Home = () => {
  const { name } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [page, hasMore, loading, transactions, loadMore, reload, fetch] =
    useInfinite({});
  // gausha pake parameter ya soalnya kita ngambilnya dari home bukan detial wallet
  const [showwallet, setShowWallet] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);

  const loadWallet = async () => {
    const data = await walletApi.index();
    setWallets(data.data.data);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      if (e.altKey) {
        if (e.key == "q") {
          setShowWallet(true);
          setShowTransaction(false);
        }
        if (e.key == "w") {
          setShowWallet(false);
          setShowTransaction(true);
        }

        if (e.key == "Escape") {
          setShowWallet(false);
          setShowTransaction(false);
        }
      }

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleDataChange = () => {
    loadWallet();
    reload();
  };

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const showDate = (index) => {
    if (index <= 0) return true;
    return transactions[index].date != transactions[index].date;
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
            <a onClick={() => setShowTransaction(true)} className="btn">
              Add Transaction
            </a>
          </div>
        </div>
        <div className="-mb-3">
          <h3 className="text-xl font-medium mb-3">Balance</h3>
          <div className="flex flex-nowrap overflow-x-auto gap-3 lg:gap-4 pb-3 lg:pb-5">
            <a
              onClick={() => setShowWallet(true)}
              className="border border-slate-700 p-5 rounded-xl flex items-center justify-center aspect-[5/2] text-4xl font-light hover:bg-slate-800"
            >
              +
            </a>
            {wallets.map((wallet) => {
              return (
                <Link
                  to={"/wallets/" + wallet.id}
                  className="p-5 border border-slate-700 rounded-xl inline-block pe-12 whitespace-nowrap hover:bg-slate-800"
                >
                  <div className="font-medium text-slate-400 mb-1.5">
                    {wallet.name}
                  </div>
                  <div className="font-semibold amount line-clamp-1 text-2xl lg:text-3xl">
                    {formatCurrency(wallet.amount, wallet.currency_code)}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="w-full max-w-[700px]">
          <h3 className="text-xl font-medium">Recent Transactions</h3>
          {transactions.map((transaction, index) => {
            return (
              <TransactionItem
                onDelete={handleDataChange}
                showDate={showDate}
                transaction={transaction}
                key={index}
              ></TransactionItem>
            );
          })}
        </div>

        <AddWalletModal
          isOpen={showwallet}
          onClose={() => setShowWallet(false)}
          onSuccess={handleDataChange}
        ></AddWalletModal>
        <AddTransanctionModal
          isOpen={showTransaction}
          onClose={() => setShowTransaction(false)}
          onSuccess={handleDataChange}
        ></AddTransanctionModal>
      </main>
    </>
  );
};
