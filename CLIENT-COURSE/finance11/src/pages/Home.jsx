 import { useEffect, useState } from "react"
import {useInfiniteScroll} from '../hooks/useInfiniteScroll.js';
import { walletApi } from "../api/wallet.js";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format.js";
import TransactionItem from "../components/TransactionItem.jsx";
import AddWallet from "../components/AddWallet.jsx";
import AddTransaction from "../components/AddTransaction.jsx";
 const Home = ({}) => {

  const [wallets, setWallets] = useState([]);
  const {user} = useAuth()
  const [transactions, page, hasMore, loading, loadMore, reload] = useInfiniteScroll({});
  const [sw, setSw] = useState(false);
  const [st, setSt] = useState(false);
  const [loadingWallet, setloadingWallet] = useState(false);

  const loadWallets = () => {
    setloadingWallet(true)
    walletApi.index().then(response => {
      setWallets(response.data.data.wallets || []);

    }).catch(e =>alert('gagal nampilin wllets', e)).finally(() => setloadingWallet(false))
  }

  useEffect(() => {
    loadWallets()
    reload()
  }, []);
  
  useEffect(() => {
    const click = (e) => {
      if(e.key == "escape"){
        setSw(false);
        setSt(false);
      }
      if(!e.ctrlKey)return;
      if(e.key == "q"){
        setSw(true);
        setSt(false);
      }
      if(e.key == "Escape"){
        setSw(false);
        setSt(false);
      }
    }
    window.addEventListener('keydown', click);
    return () => window.addEventListener('keydown', click);
  }, []);

  const showDate = (index) => {
    if(index === 0)return true;
    return transactions[index].date != transactions[index+1].date;
  }

  const handleDataChange = () => {
    reload();
    loadWallets()
  }




  return <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
                <h2 className="text-2xl font-semibold">Hi ${user.username}👋</h2>
                <p className="text-sm text-slate-400 mt-0.5">Let’s check where your money’s going and growing.</p>
            </div>
            <div className="flex items-center gap-3">
                <a onClick={() =>setSt(true)} className="btn">Add Transaction</a>
            </div>
        </div>

        <div className="-mb-3">
            <h3 className="text-xl font-medium mb-3">Balance</h3>
            <div className="flex flex-nowrap overflow-x-auto gap-3 lg:gap-4 pb-3 lg:pb-5">
                <a onClick={() => setSw(true)} className="border border-slate-700 p-5 rounded-xl flex items-center justify-center aspect-[5/2] text-4xl font-light hover:bg-slate-800">
                    +
                </a>
               {
                loadingWallet ? <>loading wallet...</>: wallets && wallets.map((wallet, index) => {
                  return  <Link key={index} to={'wallet-detail/'+wallet.id} className="p-5 border border-slate-700 rounded-xl inline-block pe-12 whitespace-nowrap hover:bg-slate-800">
                    <div className="font-medium text-slate-400 mb-1.5">{wallet.name}</div>
                    <div className="font-semibold amount line-clamp-1 text-2xl lg:text-3xl">{formatCurrency(wallet.balance, wallet.currency_code)}</div>
                </Link>
                })
               }
            </div>
        </div>

        <div className="w-full max-w-[700px]">
            <h3 className="text-xl font-medium">Recent Transactions</h3>

              {
                transactions && transactions.map((transaction, index) => {
                  return <TransactionItem onDelete={handleDataChange} showDate={() => showDate(index)} transaction={transaction} key={index}></TransactionItem>
                })
              }
              {
                loading && hasMore && <>Loading.....</>
              }
              {
                !loading & hasMore && <button onClick={() => loadMore()}>loadMore</button>
              }
              {
                !loading && transactions.length <= 0 && !hasMore && <>kosong</>
              }
              {
                !loading && transactions.length >= 0 && !hasMore && <>udah nyampe batas</>
              }

        </div>
        <AddWallet isOpen={sw} onClose={handleDataChange} onSuccess={() => setSw(false)} ></AddWallet>
        <AddTransaction isOpen={st} onClose={handleDataChange} onSuccess={() => setSt(false)} ></AddTransaction>
    </main>
 }

 export default Home;