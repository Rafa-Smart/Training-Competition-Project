import { useEffect, useRef, useState } from "react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import Chart from "chart.js/auto";
import { Link, useNavigate, useParams } from "react-router-dom";
import { walletApi } from "../api/wallet";
import { formatCurrency } from "../utils/format";
import { reportApi } from "../api/report";
import TransactionItem from "../components/TransactionItem";
import AddTransaction from "../components/AddTransaction";
import Transfer from "../components/Transfer";
const years = Array.from({ length: 16 }, (_, index) => 2015 + index);
const month = [
  "Jan",
  "Feb",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Agt",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const WalletDetail = () => {
  const navigate = useNavigate();
  const { walletId } = useParams();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [wallet, setWallet] = useState();
  const [loadingWallet, setLoadingWallet] = useState();
  const [editName, setEditName] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const expenseRef = useRef();
  const incomeRef = useRef();
  const instanceIncome = useRef();
  const instanceeExpense = useRef();
  const [showTransaction, setShowTransaction] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const [transactions, page, hasMore, loading, loadMore, reload] =
    useInfiniteScroll({
      month: selectedMonth,
      year: selectedYear,
      wallet_id: walletId,
    });

  const loadWallet = () => {
    setLoadingWallet(true);
    walletApi.show(walletId).then((response) => {
      console.log(response.data.data)
      setWallet(response.data.data || {});
      setEditName(response.data.data.name);
    }).catch(e => alert('gagal ambil data wallet')).finally(() => setLoadingWallet(false))
  }


  useEffect(() => {
    const click = (e) => {
      if (e.key == "escape") {
        setShowTransaction(false);
        setShowTransfer(false);
      }
      if (!e.ctrlKey) return;
      if (e.key == "q") {
        setShowTransaction(true);
        setShowTransfer(false);
      }
      if (e.key == "Escape") {
        setShowTransaction(false);
        setShowTransfer(false);
      }
    };
    loadWallet()
    window.addEventListener("keydown", click);
    return () => window.addEventListener("keydown", click);
  }, []);

  const handleDataChange = () => {
    reload();
    loadWallet()
  }

  useEffect(() => {
    handleDataChange();
  }, [selectedMonth, selectedYear, walletId]);



  useEffect(() => { 
      reportApi.income({month:selectedMonth, year:selectedYear}).then(response => {
        renderChart(expenseRef, instanceeExpense, response.data.data.summary, 'EXPENSE');
      }).catch(e => alert(e));
      reportApi.expense({month:selectedMonth, year:selectedYear}).then(response => {
        renderChart(incomeRef, instanceIncome, response.data.data.summary, "INCOME")
      }).catch(e => alert(e))
  },  [selectedMonth, selectedYear, walletId, wallet])


  const showDate = (index) => {
    if(index === 0) return true;
    return transactions[index].date != transactions[index].date;
  }


  const renderChart = (ref, instanceRef, summary, type) => {
    if(!ref.current)return;
    if(summary && summary.length == 0)return;
    if(instanceRef.current){
      instanceRef.current.destroy();
    }

    const datas = summary.map((s) => s.amount);
    const colors = summary.map((s) => s.category.color || 'yellow');
    const labels= summary.map(s => `${s.category.icon} ${s.category.name}`);


    instanceRef.current = new Chart(ref.current, {
      type:'doughnut',
      data: {
        labels:labels,
        datasets:[
          {
            backgroundColor:colors,
            data:datas,
            borderColor:'red',
            borderWidth:5
          }
        ]
      },
      options:{
        responsive:true,
        plugins:{
          legend:{
            position:"bottom",
            labels:{
              color:"blue"
            }
          }
        }
      }
    })
  }

  



  const handleEdit =  (e) => {
    if(!e.key == "Enter")return;
    if(editName != ''){
      // edit
       walletApi.update({...wallet, name:editName}).then(response => {
         setWallet(prev => ({...prev,name:editName}))
       }).catch(e => alert(e));
    }else {
      // apus
     const confirmed = confirm('apakah apus ?');
     if(confirmed){
       walletApi.delete(wallet.id).then(() => navigate('/')).catch(e => {
        navigate('/');
        akert(e)
      })
     }
    }
    setIsEdit(false)
  }
  if(!wallet){
    return  <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">loading...</main>
  }

  return (
    <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
      <div className="flex items-center gap-3.5">
        <Link 
        to={'/'}
          className="btn btn text-lg! aspect-[1/1] inline-flex! bg-transparent! p-3.5! border border-slate-700 items-center justify-center leading-[1]"
        >
          ←
        </Link>
        {
          isEdit ? <input type='text' onKeyDown={handleEdit} value={editName}></input> : <h2 onClick={() => setIsEdit(true)} className="text-2xl font-semibold">{editName}</h2>
        }
      </div>

      <div className="w-full max-w-[700px] mx-auto">
        <div className="pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <h2 className="text-lg text-slate-400 font-medium mb-1">
              Total balance
            </h2>
            <div className="font-semibold line-clamp-1 text-4xl">
              {formatCurrency(wallet.balance, wallet.currency_code)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a onClick={() => setShowTransfer(true)} className="btn">
              Transfer Money
            </a>
            <a onClick={() => setShowTransaction(true)}  className="btn">
              Add Transaction
            </a>
          </div>
        </div>

        <div className="w-full py-2">
          <div className="grid grid-cols-[auto_1fr] items-center mb-5 border-b border-slate-700">
            <div className="overflow-hidden rounded-tl-lg rounded-tr-lg">
              <select className="form-input" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                {
                  years.map((y, index) => {
                    return <option key={index} value={y}>{y}</option>
                  })
                }
              </select>
            </div>
            <div className="flex overflow-x-auto h-full">
              {
                month.map((m, index) => {
                  return <button  key={index}
                  onClick={() => setSelectedMonth(index+1)}
                className={`whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg ${index+1 == selectedMonth ? "opacity-100":"opacity-50"}`}
              >
                {m}
              </button>
                })
              }
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 py-6">
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-lg">EXPENSE</h2>
              <canvas ref={expenseRef}></canvas>
            </div>
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-lg">INCOME</h2>
              <canvas ref={incomeRef}></canvas>
            </div>
          </div>

          <div className="flex items-center justify-between mt-7">
            <h3 className="text-xl font-medium">Transactions</h3>
          </div>
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
      </div>
      <AddTransaction defaultId={walletId} isOpen={showTransaction} onClose={() => setShowTransaction(false) } onSuccess={handleDataChange}></AddTransaction>
      <Transfer defaultId={walletId} isOpen={showTransfer} onClose={() => setShowTransfer()} onSuccess={handleDataChange}></Transfer>
    </main>
  );
};

export default WalletDetail;
