import { useState } from "react";
import useInfinite from "../hooks/useInfinite";

export default Home = () => {
  const [wallets, setwallets] = useState([]);
  const { user } = useState(); //gantu useauh
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false)
  const [showWallet, setShowWallet] = useState(false)
  const fetchWallets = async () => {
    setLoadingWallets(true);
    try {
      const data = useState();
      setwallets(data.data.data);
    } catch (e) {
      alert(e);
    } finally {
      setLoadingWallets(false);
    }
  };
  useEffect(() => {
    fetchWallets();
  }, []);

  const handleDataChange = () => {
    loadMore();
    fetchWallets();
  };
  const showDate = (index) => {
    if (index <= 0) return true;
    return transactions[index].date != transactions[index - 1].date;
  };

  const [transactions, page, hasMore, loading, loadMore, fetchData, reset] =
    useInfinite({
      month: selectedMonth,
      year: selectedYear,
      wallet_id: walletId,
    });
  useEffect(() => {
    function handleKeyDown(e) {
      if (!e.ctrlKey) return;
      if (e.key == "") {
        setShowTransaction(true);
        setShowWallet(false);
      } else if (e.key == "") {
        setShowTransaction(false);
        setShowWallet(true);
      } else if (e.key == "") {
        setShowTransaction(false);
        setShowWallet(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
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
          <div class="flex flex-nowrap overflow-x-auto gap-3 lg:gap-4 pb-3 lg:pb-5">
            <a
              href=""
              class="border border-slate-700 p-5 rounded-xl flex items-center justify-center aspect-[5/2] text-4xl font-light hover:bg-slate-800"
            >
              +
            </a>
            <a
              href="wallet-detail.html"
              class="p-5 border border-slate-700 rounded-xl inline-block pe-12 whitespace-nowrap hover:bg-slate-800"
            >
              <div class="font-medium text-slate-400 mb-1.5">Wallet Name</div>
              <div class="font-semibold amount line-clamp-1 text-2xl lg:text-3xl">
                Rp 250.000
              </div>
            </a>
          </div>
        </div>

        <div class="w-full max-w-[700px]">
          <h3 class="text-xl font-medium">Recent Transactions</h3>

          <div class="cursor-pointer flex lg:items-center justify-between border-b border-slate-700 py-3 lg:py-4 gap-3 text-lg">
            <div class="flex lg:items-center gap-3">
              <div class="aspect-[1/1] h-[40px] flex items-center justify-center bg-red-200 border-2 border-red-300 rounded-full">
                Icon
              </div>
              <div>
                <div class="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                  <div class="font-medium">Category</div>
                  <div class="text-slate-400 text-sm lg:text-[1rem]">
                    Wallet name
                  </div>
                </div>
                <div class="text-slate-400 text-xs lg:text-sm">
                  Note (optional)
                </div>
              </div>
            </div>
            <div class="amount font-medium">Rp 250.000</div>
          </div>
          <div class="cursor-pointer flex lg:items-center justify-between border-b border-slate-700 py-3 lg:py-4 gap-3 text-lg">
            <div class="flex lg:items-center gap-3">
              <div class="aspect-[1/1] h-[40px] flex items-center justify-center bg-red-200 border-2 border-red-300 rounded-full">
                Icon
              </div>
              <div>
                <div class="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                  <div class="font-medium">Category</div>
                  <div class="text-slate-400 text-sm lg:text-[1rem]">
                    Wallet name
                  </div>
                </div>
                <div class="text-slate-400 text-xs lg:text-sm">
                  Note (optional)
                </div>
              </div>
            </div>
            <div class="amount font-medium">-Rp 250.000</div>
          </div>
        </div>
      </main>
    </>
  );
};
