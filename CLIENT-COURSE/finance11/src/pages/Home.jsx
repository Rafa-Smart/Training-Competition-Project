import { useEffect, useState } from "react"
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useAuth } from "../context/AuthContext";
import { walletApi } from "../api/wallet";
import { Link } from "react-router";
import { formatCurrency } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddTransaction from "../components/AddTransaction";
import AddWallet from "../components/AddWallet";

const Home = ({}) => {
    const [wallets, setWallets] = useState([]);
    const {user} = useAuth();
    const [transactions, page, hasMore, loading, loadMore, reload] = useInfiniteScroll({});
    const [showWallet, setShowWallet] = useState(false);
    const [showTransaction, setShowTransaction] = useState(false);

    const loadWallet = () => {
        walletApi.index().then(response =>{
            setWallets(response?.data?.data?.wallets || [])
        }).catch(e => alert(e)) 
    }
    useEffect(() => {
        loadWallet()
    }, []);

    useEffect(() => {
        const click = function(e){
            if(e.key== "Escape"){
                e.preventDefault()
                setShowWallet(false)
                setShowTransaction(false)
            }
            if(!e.ctrlKey)return;
            if(e.key == 'q'){
                e.preventDefault()
                setShowWallet(false)
                setShowTransaction(true)
            }
            if(e.key == 'w'){
                e.preventDefault()
                setShowWallet(true)
                setShowTransaction(false)
            }
        }
        window.addEventListener('keydown', click);
        return () => window.removeEventListener('keydown', click);
    }, [])
    const showDate = (index) => {
        if(index == 0)return false;
        return transactions[index].date != transactions[index-1].date;
    }
    const handleChange = () => {
        reload();
        loadWallet()
    }

    return <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
                <h2 className="text-2xl font-semibold">Hi Budi👋</h2>
                <p className="text-sm text-slate-400 mt-0.5">Let’s check where your money’s going and growing.</p>
            </div>
            <div className="flex items-center gap-3">
                <a onClick={(e) => setShowTransaction(true)} className="btn">Add Transaction</a>
            </div>
        </div>

        <div className="-mb-3">
            <h3 className="text-xl font-medium mb-3">Balance</h3>
            {
                wallets && wallets.map((wallet, index) => {
                    return <Link key={index} to={`wallet-detail/`+wallet.id} className="flex flex-nowrap overflow-x-auto gap-3 lg:gap-4 pb-3 lg:pb-5">
                <a onClick={(e) => setShowWallet(true)} className="border border-slate-700 p-5 rounded-xl flex items-center justify-center aspect-[5/2] text-4xl font-light hover:bg-slate-800">
                    +
                </a>
                <a href="wallet-detail.html" className="p-5 border border-slate-700 rounded-xl inline-block pe-12 whitespace-nowrap hover:bg-slate-800">
                    <div className="font-medium text-slate-400 mb-1.5">{wallet.name}</div>
                    <div className="font-semibold amount line-clamp-1 text-2xl lg:text-3xl">{formatCurrency(wallet.balance, wallet.currency_code)}</div>
                </a>
            </Link>
                })
            }
        </div>

        <div className="w-full max-w-[700px]">
            <h3 className="text-xl font-medium">Recent Transactions</h3>

            {
                transactions && transactions.map((transaction, index) => {
                    return <TransactionItem onDelete={handleChange} showDate={() => showDate(index)} transaction={transaction} key={index}></TransactionItem>
                })

            }
            {
                loading && hasMore && <>Loading...</>
            }
            {
                !loading && transactions.length == 0 && <>Kosong</>
            }
            {
                !loading && hasMore && <div onClick={() => loadMore()}>Load More</div>
            }

        </div>

            <AddTransaction defaultId={null} isOpen={showTransaction} onClose={() => setShowTransaction(false)} onSuccess={handleChange} ></AddTransaction>
            <AddWallet defaultId={null} isOpen={showWallet} onClose={() => setShowWallet(false)} onSuccess={handleChange} ></AddWallet>

    </main>
}

export default Home;