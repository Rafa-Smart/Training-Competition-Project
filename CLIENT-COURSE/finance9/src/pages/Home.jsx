import { useEffect, useState } from "react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { walletApi } from "../api/wallet";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddWallet from "../components/AddWallet";
import AddTransaction from "../components/AddTransaction";

const Home = () => {
    const [wallets, setWallets] = useState([])
    const [showWallet, setShowWallet] = useState(false);
    const [showTransaction, setShowTransaction] = useState(false);
    const {user} = useAuth();
    const [transactions, page, loading, hasMore, loadMore, reload] = useInfiniteScroll();

    const loadWallet = () => {
        walletApi.get().then(response => setWallets(response.data.wallets));
    }

    useEffect(() => {
        loadWallet();
    }, [])

    useEffect(() => {
        const handle = (e) => {
            if(e.key == "Escape"){
                 e.preventDefault()
                setShowTransaction(false);
                setShowWallet(false)
            }

            if(!e.altKey)return;
            if(e.key == "w"){
                 e.preventDefault()
                setShowTransaction(false);
                setShowWallet(true)
            }
            if(e.key == "n"){
                e.preventDefault()
                setShowTransaction(true);
                setShowWallet(false)
            }
        }
        window.addEventListener('keydown', handle)
        return () => window.removeEventListener('keydown', handle)
    }, [])

    const handleDataChage = () => {
        loadWallet();
        loadMore(1, true);
    }

    const showDate = (index) =>{
        if(index == 0)return true;
        return transactions[index].date != transactions[index-1].date
    }


    return <>

          <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
                <h2 className="text-2xl font-semibold">Hi {user.name}👋</h2>
                <p className="text-sm text-slate-400 mt-0.5">Let’s check where your money’s going and growing.</p>
            </div>
            <div className="flex items-center gap-3">
                <a onClick={() => showTransaction(true)} className="btn">Add Transaction</a>
            </div>
        </div>

        <div className="-mb-3">
            <h3 className="text-xl font-medium mb-3">Balance</h3>
            <div className="flex flex-nowrap overflow-x-auto gap-3 lg:gap-4 pb-3 lg:pb-5">
                            <a onClick={() => setShowWallet(true)} className="border border-slate-700 p-5 rounded-xl flex items-center justify-center aspect-[5/2] text-4xl font-light hover:bg-slate-800">
                    +
                </a>
                {
                    wallets.map((wallet, index) => {
                        return <>
                <a href="wallet-detail.html" className="p-5 border border-slate-700 rounded-xl inline-block pe-12 whitespace-nowrap hover:bg-slate-800">
                    <div className="font-medium text-slate-400 mb-1.5">{wallet.name}</div>
                    <div className="font-semibold amount line-clamp-1 text-2xl lg:text-3xl">{formatCurrency(wallet.balance, wallet.currency_code)}</div>
                </a>
                        </>
                    })
                }
            </div>
        </div>

        <div className="w-full max-w-[700px]">
            <h3 className="text-xl font-medium">Recent Transactions</h3>

               {
                transactions.map((transaction, index) => {
                    return  <TransactionItem onDelete={handleDataChage} showDate={() => showDate(index)} transaction={transaction} key={index} ></TransactionItem>
                })
               }

        </div>
    </main>

    <AddWallet  isOpen={showWallet} onClose={() => setShowWallet(false)} onSuccess={handleDataChage}></AddWallet>

    <AddTransaction  isOpen={showTransaction} onClose={() => setShowTransaction(false)} onSuccess={handleDataChage}></AddTransaction>
    </>
}

export default Home;