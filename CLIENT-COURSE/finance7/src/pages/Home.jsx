import { useEffect, useState } from "react";
import { walletApi } from "../api/wallet";
import useInfinite from "../hooks/useInfinite";
import { useAuth } from "../context/authContext";
import { formatCurrency } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddWalletModal from "../components/AddWalletModal";
import AddTransaction from "../components/AddTransaction";

export default Home = () => {
  const [showWallet, setShowWallet] = useState(false);
  const [showTransaction, setShowTransactions] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.ctrlKey) return;
      if (e.key == "") {
        setShowTransactions(false);
        setShowWallet(true);
      }
      if (e.key == "") {
        setShowTransactions(true);
        setShowWallet(false);
      }
      if (e.key == "Escape") {
        setShowTransactions(false);
        setShowWallet(falses);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const loadWallets = async () => {
    setLoadingWallet(true);
    try {
      const data = await walletApi.index();
      setWallets(data.data.data);
    } catch (e) {
      alert("err", e);
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const [transactions, page, hasMore, loading, loadMore, fetchData, reset] =
    useInfinite();

  const handleDataChange = () => {
    fetchData(1, true);
    loadWallets();
  };
  const showDate = (index) => {
    if (index <= 0) return true;
    return transactions[index].date != transactions[index].date;
  };

  return (
    <>
      <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h2 className="text-2xl font-semibold">Hi {user.name}</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Let’s check where your money’s going and growing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a onClick={() => setShowTransactions(true)}>Add Transaction</a>
          </div>
        </div>
        <div className="-mb-3">
          <h3 className="text-xl font-medium mb-3">Balance</h3>
          {wallets.map((wallet) => {
            return (
              <>
                <div className="flex flex-nowrap overflow-x-auto gap-3 lg:gap-4 pb-3 lg:pb-5">
                  <a
                    onClick={() => setShowWallet(true)}
                    className="border border-slate-700 p-5 rounded-xl flex items-center justify-center aspect-[5/2] text-4xl font-light hover:bg-slate-800"
                  >
                    +
                  </a>
                  <Link
                    to={"wallet-detail/" + wallet.id}
                    className="p-5 border border-slate-700 rounded-xl inline-block pe-12 whitespace-nowrap hover:bg-slate-800"
                  >
                    <div className="font-medium text-slate-400 mb-1.5">
                      {wallet.name}
                    </div>
                    <div className="font-semibold amount line-clamp-1 text-2xl lg:text-3xl">
                      {formatCurrency(wallet.amount, wallet.currency_code)}
                    </div>
                  </Link>
                </div>
              </>
            );
          })}
        </div>
        <div className="w-full max-w-[700px]">
          <h3 className="text-xl font-medium">Recent Transactions</h3>
         {
            transactions.map((transaction, index) => {
                return <> <TransactionItem 
                onDelete={}
                showDate={() => showDate(index) }
                transaction={transaction}
                key={index}
          ></TransactionItem></>
            })
         }
        </div>
      </main>
      <AddWalletModal isOpen={showWallet} onClose={() => setShowWallet(false)} onSuccess={handleDataChange}></AddWalletModal>
      <AddTransaction isOpen={showTransaction} onClose={() => setShowTransactions(false)} onSuccess={handleDataChange} defaultWalletId={null}></AddTransaction>
      <></>
    </>
  );
};
