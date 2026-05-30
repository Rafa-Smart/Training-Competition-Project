import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { walletApi } from "../api/wallet";
import { Chart, Legend, plugins } from "chart.js";
import { formatCurrency } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddTransaction from "../components/AddTransaction";
import Transfer from "../components/Transfer";
const years = Array.from({length:16}, (_, i) => 2015+ i);
const months = [
    'Jan',"Feb","Mar","Apr",'May',"Jun",'Jul','Agt',"Sep",'Okt',"Nov","Des"
]
const DetailWallet = () => {

    const {walletId} = useParams();
    const navigate = useNavigate();
    const today = new Date();
    const [wallet, setWallet] = useState();
    const [editName, setEditName] = useState();
    const [isEdit, setIsEdit] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState();
    const [selectedYear, setSelectedYear] = useState();

    const [showTransaction, setShowTransaction] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);

    const [transactions, page, loading, hasMore, loadMore, reload] = useInfiniteScroll({
        month:selectedMonth,
        year:selectedYear,
        wallet_id:walletId
    })

    const expenseRef = useRef();
    const incomeRef = useRef();
    const expenseInstanceRef = useRef();
    const incomeInstanceRef = useRef();

    const handleClickEdit =async (e) => {
        const name = editName.trim();
        if(name==''){
            // hapus
          try {
            await  walletApi.destroy(walletId);
            navigate('/')
          }catch(e){
            alert('gagal delete')
          }
        }else {
            // update
           try{
             await walletApi.update(editName, walletId);
            setWallet((prev) => ({...wallet, name:editName}))
            setIsEdit(false)
            
           }catch(e){
            alert('gagal update')
           }
        }
        handleDataChange()
    }

    const loadWallet = async() => {
        walletApi.show(walletId).then(response => setWallet(response.data.data))
        setEditName(wallet.name)
    }
    useEffect(() => {
        loadWallet();
    }, [walletId])

    useEffect(() => {
        loadMore(1, true);
    }, [selectedMonth, selectedYear, walletId])

    useEffect(() => {
        loadWallet()
        loadMore(1, true)
    },[])
    const handleDataChange = () => {
        loadWallet();
        loadMore(1, true);
    }

    const showDate = (index) => {
        if(index == 0)return true;
        return transactions[index].date != transactions[index-1].date;
    }

    useEffect(() => {
        
    }, [selectedMonth, selectedYear, walletId])

    const renderChart = (ref, instanceRef, summary, type) => {
        if(!ref.current)return
        if(instanceRef.current){
            instanceRef.current.destroy();
        }
        if(!summary || !summary.length)return;

        const data = summary.map((s) => s.amount);
        const labels = summary.map((e) => `${e.category.icon} ${e.category.name}`);
        const colors = summary.map((e) => e.category.color || 'gray');

        instanceRef.current = new Chart(ref, {
            type:'doughnut',
            data:{
                labels:labels,
                dataset:[
                    {
                        data:data,
                        backgroundColor:colors,
                        borderWidth:3,
                        borderColor:"black"
                    }
                ]
            },
            option:{
                responsive:true,
                plugins:{
                    Legend:{
                        position:"bottom",
                        labels:{color:"red", padding:"4px", font:{size:14}}
                    }
                }
            }
        })
    }

    return <>
    <main class="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div class="flex items-center gap-3.5">
            <a href="index.html" class="btn btn text-lg! aspect-[1/1] inline-flex! bg-transparent! p-3.5! border border-slate-700 items-center justify-center leading-[1]">
                ←
            </a>
           {
            editName ?  <input type='text' value={wallet.name} onKeyDown={handleClickEdit}
            onBlur={() => {
                setIsEdit(false)
                setEditName(wallet.name)
            }} class="text-2xl font-semibold">
                {wallet.name}
            </input>: <h2  onDoubleClick={() => setIsEdit(true)} class="text-2xl font-semibold">
                {wallet.name}
            </h2>
           }
        </div>

        <div class="w-full max-w-[700px] mx-auto">

            <div class="pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                <div>
                    <h2 class="text-lg text-slate-400 font-medium mb-1">Total balance</h2>
                    <div class="font-semibold line-clamp-1 text-4xl">{formatCurrency(wallet.balance, wallet.currency_code)}</div>
                </div>
                <div class="flex items-center gap-3">
                    <a onClick={() => setShowTransfer(true)} class="btn">Transfer Money</a>
                    <a onClick={() => setShowTransaction(true)} class="btn">Add Transaction</a>
                </div>
            </div>

            <div class="w-full py-2">
                <div class="grid grid-cols-[auto_1fr] items-center mb-5 border-b border-slate-700">
                    <div class="overflow-hidden rounded-tl-lg rounded-tr-lg">
                        <select value={selectedMonth} class="form-input" onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                            {
                                months.map((month, index) => {
                                    return <option key={index} value={month}>{month}</option>
                                })
                            }
                        </select>
                    </div>
                    <div class="flex overflow-x-auto h-full">
                       {
                        years.map((year, index) => {
                            return  <button key={index} onClick={(e) => Number(e.target.value)} class={`whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg ${year == selectedYear ? 'opacity-100':'opacity-50'}`}>
                            {year}
                        </button>
                        })
                       }
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-10 py-6">
                    <div class="flex flex-col items-center gap-5">
                        <h2 class="text-lg">EXPENSE</h2>
                       <canvas ref={expenseRef}></canvas>
                    </div>
                    <div class="flex flex-col items-center gap-5">
                        <h2 class="text-lg">INCOME</h2>
                       <canvas ref={incomeRef}></canvas>

                    </div>
                </div>

                <div class="flex items-center justify-between mt-7">
                    <h3 class="text-xl font-medium">Transactions</h3>
                </div>
                    {
                        transactions.map((transaction, index) =>{
                            return <TransactionItem onDelete={handleDataChange} showDate={() => showDate(index)} transaction={transaction} key={index}></TransactionItem>
                        })
                    }
                    {
                        loading && hasMore && <span className='loading'></span>
                    }
                    {!loading && transactions.length==0 &&<h3>kosong</h3>}
                    {!loading && hasMore &&<p onClick={() => loadMore()}>LoadMore</p>}
            </div>

        </div>
        <AddTransaction isOpen={showTransaction} defaultId={walletId} onClose={() => setShowTransaction(false)} onSuccess={handleDataChange}></AddTransaction>
        <Transfer defaultId={walletId} isOpen={showTransfer} onClose={() => setShowTransfer} onSuccess={handleDataChange} ></Transfer>
    </main>        

    </>
}

export default DetailWallet;