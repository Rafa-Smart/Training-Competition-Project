import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { walletApi } from "../api/wallet";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddTransactionModal from "../components/AddTransactionModal";

export default Overview = () => {
  const [user, isLoading] = useAuth();
  const [wallets, setWallets] = useState([]);
  // const [transactions, setTransactions] = useState([]); // ini akna kita dapat dari useInfinite
  const [showAddwallet, setShowAddWallet] = useState(false);
  const [showAddTransaction, setAddTransaction] = useState(false);

  //   disni ktia ambil semuanya return dari si useinfinite
  const { transactions, loading, hasMore, loadMore, fetchPage, reload } =
    useInfiniteScroll({});
  // nah karena kita panggilnya itu dari overview maka parameterny itu kosong ya

  const loadWallets = useCallback(async () => {
    const data = await walletApi.index();
    setWallets(data.data.data.wallets || []);
  }, []);

  useEffect(async () => {
    loadWallets();
  }, []);

  //   nah ini untuk shortcutnya ya

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    const handleKeyDown = (e) => {
      // tapi semua ini itu harus di klik slt ya

      if (e.altKey) {
        if (e.key == "w") {
          e.preventDefault();
          // jadi kalo dia klik w maa kna mncul modal add wallet;
          setShowAddWallet(true);
        }

        if (e.key == "n") {
          e.preventDefault();
          showAddTransaction(true);
        }
        if (e.key == "Escape") {
          e.preventDefault();
          setShowAddWallet(false);
          setAddTransaction(false);
        }
      }
    };

    // ini akna di panggil ketka dia aka panddgil lagi si useeffect ini
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  //   JADI GNI RELOAD (AMBIL DATA TRANSAKSI) DAN JGUA LOADWALLET (AMBIL DATA WALLET);
  // ITU AKAN DI PANGGIL KETIAK AD ADATA YANG BERUBAH

  const handleChange = () => {
    loadWallets(); // ambil wallet
    reload(); // ambil transaksi
  };

  // nah disini kita kan buat fungsi untk cek (ini penting ya soalnya datenya ini hanya munucl sekali aja di tiap periode nya)

  const showDate = (index) => {
    if (index == 0) return true;
    // ini true untuk indx pertama ya, kareana ayaa index pertama mah kan dia butuh nampilin datanya

    // nah ini baru dia akna bandingkan dngne index sebelumnya
    return transactions[index].date !== transactions[index - 1].date;
  };

  return (
    <>
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
        {wallets.map((wallet) => {
          return (
            <>
              {" "}
              <div class="flex flex-nowrap overflow-x-auto gap-3 lg:gap-4 pb-3 lg:pb-5">
                <Link
                  to={"/add-wallet"}
                  class="border border-slate-700 p-5 rounded-xl flex items-center justify-center aspect-[5/2] text-4xl font-light hover:bg-slate-800"
                >
                  +
                </Link>
                <Link
                  to={"/detail-wallet/" + wallet.id}
                  class="p-5 border border-slate-700 rounded-xl inline-block pe-12 whitespace-nowrap hover:bg-slate-800"
                >
                  <div class="font-medium text-slate-400 mb-1.5">
                    {wallet.name}
                  </div>
                  <div class="font-semibold amount line-clamp-1 text-2xl lg:text-3xl">
                    {formatCurrency(wallet.amount, wallet.currency_code)}
                  </div>
                </Link>
              </div>
            </>
          );
        })}
      </div>

      <div class="w-full max-w-[700px]">
        <h3 class="text-xl font-medium">Recent Transactions</h3>

        {transactions.map((transaction, index) => {
          return (
            <TransactionItem
              onDelete={handleChange} // disni onDelete itu ibaratna untuk refresh ya(liat aja isi dari hadnleChange)
              transaction={transaction}
              showDate={() => showDate(index)}
            ></TransactionItem>
          );
        })}

        {loading && <div className="text-center">loading... </div>}

        {/* kalo engga ada transaksi sama sekali */}
        {!loading && transactions.length <= 0 && (
          <div className="text-center">kosong</div>
        )}

        {/* jadi kalo misalnya itu udah ga lodaing tapi amsih ada hasmorney (artiya kan masih ad tapi belum di klik loadMrore) */}
        {hasMore && !loading && (
          <button
            onClick={loadMore}
            className="w-full py-3 text-slate-400 hover:text-white text-sm mt-2"
          >
            Load More
          </button>
        )}
      </div>

      <AddWalletModal
        isOpen={showAddwallet}
        onClose={() => setShowAddWallet(false)}
        onSuccess={handleChange}
      />
      <AddTransactionModal
        // defaultWalletId={} ini di ksoongin aja soalnya kita dari overview
        isOpen={showAddTransaction}
        isClose={() => setAddTransaction(false)}
        onSuccess={handleChange} // ini untuk reload
      ></AddTransactionModal>
    </>
  );
};
