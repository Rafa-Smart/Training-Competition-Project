import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useInfinite from "../hooks/useInfinite";
import {
  ArcElement,
  Chart,
  DoughnutController,
  Legend,
  Tooltip,
} from "chart.js";
import { walletApi } from "../api/wallet";
import TransactionItem from "../components/TransactionItem";
import AddTranferModal from "../components/AddTranferModal";
import AddTransanctionModal from "../components/AddTransanctionModal";
Chart.register(ArcElement, Tooltip, Legend, DoughnutController);
const Year = Array.from({ length: 16 }, (_, index) => 2015 + index);
const Month = [
  "Jan",
  "Feb",
  "mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
export default WalletDetail = () => {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({});
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedyear, setSelectedYear] = useState(now.getFullYear());
  const [showTransfer, setShowTransfer] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [page, hasMore, loading, transactions, loarMore, fetch, reload] =
    useInfinite({
      // disni kita kasih parameter karena kita pangginya itu dari wallet detail
      month: selectedMonth,
      year: selectedMonth,
      wallet_id: walletId,
    });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(wallet.name);
  const [IncomeRef, setIncomeref] = useRef(null);
  const [ExpenseRef, setExpenseRef] = useRef(null);
  const [instanceExpense, setInstanceExpense] = useRef(null);
  const [instanceIncome, setInstanceIncome] = useRef(null);

  //   kita draw si chartnya
  useEffect(() => {
    if (!wallet) return;
    try {
        const data = r
    } catch (e) {
      alert("gagal ambil data expense summary");
    }
    try {
    } catch (e) {
      alert("gagal ambil data income summary");
    }
  });

  // fungsi untuk draw si chartnya
  const renderChart = (chartRef, instanceRef, summary, type) => {
    if (!chartRef.current) return;
    if (!instanceRef.current) {
      instanceRef.current.destroy();
    }
    if (!summary || summary.length <= 0) return;
    let data, labels, colors;
    summary.forEach((s, index) => {
      data.push(s.amount);
      colors.push(s.category.color || "red");
      labels.push(`${s.category.icon} ${s.category.name}`);
    });

    instanceRef.current = new Chart(chartRef, {
      type: "doughnut",
      data: {
        labels: labels,
        dataset: {
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "red",
        },
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "red",
              padding: 10,
              font: {
                size: 11,
              },
            },
          },
        },
      },
    });
  };

  const loadWallet = async () => {
    try {
      const data = await walletApi.show(walletId);
      setWallet(data.data.data);
    } catch (e) {
      Navigate("/"); //jadi kalo error ya balik aja ke home
    }
  };

  const handleEditName = async (e) => {
    if (!e.key == "Enter") return;
    const name = editName.trim();
    if (name == "") {
      const confirmed = confirm("apaakh bener mau di delete ?");
      if (!confirmed) return;
      try {
        await walletApi.destroy(walletId);
        navigate("/");
        return;
      } catch (e) {
        alert("gagal hapus wallet");
      }
    } else {
      try {
        // nah ini kalo edit ya
        await walletApi.update(walletId, { name });
        //  kita set ke wallet ya
        setWallet((prev) => ({ ...wallet, name: editName }));
        // kita false in lagi si is edit
        setIsEditingName(false);
      } catch (e) {
        alert("gagal update wallet");
      }
    }
  };

  const handleDataChange = () => {
    reload();
    loadWallet();
  };

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

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

  const showDtae = (index) => {
    if (index <= 0) return true;
    return transactions[index].date != transactions[index - 1].date;
  };

  return (
    <>
      <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div className="flex items-center gap-3.5">
          <Link
            to={"/"}
            className="btn btn text-lg! aspect-[1/1] inline-flex! bg-transparent! p-3.5! border border-slate-700 items-center justify-center leading-[1]"
          >
            ←
          </Link>
          {isEditingName ? (
            <input
              type="text"
              value={wallet.name}
              onBlur={() => {
                setEditName(wallet.name);
                setIsEditingName(false);
              }}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-2xl font-semibold"
            >
              {wallet.name}
            </input>
          ) : (
            <h2 className="text-2xl font-semibold">{wallet.name}</h2>
          )}
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
              <a onClick={() => setShowTransaction(true)} className="btn">
                Add Transaction
              </a>
            </div>
          </div>
          <div className="w-full py-2">
            <div className="grid grid-cols-[auto_1fr] items-center mb-5 border-b border-slate-700">
              <div
                className="overflow-hidden rounded-tl-lg rounded-tr-lg"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <select className="form-input">
                  {Year.map((y, i) => (
                    <option key={i} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex overflow-x-auto h-full">
                {Month.map((m, i) => (
                  <button
                    className={`whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg ${selectedMonth == i + 1 ? "opacity-100" : "opacity-50"} `}
                    value={i}
                    key={i}
                    onClick={(e) => setSelectedMonth(i + 1)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10 py-6">
              <div className="flex flex-col items-center gap-5">
                <h2 className="text-lg">EXPENSE</h2>
                <canvas ref={ExpenseRef}></canvas>
              </div>
              <div className="flex flex-col items-center gap-5">
                <h2 className="text-lg">INCOME</h2>
                <canvas ref={IncomeRef}></canvas>
              </div>
            </div>
            <div className="flex items-center justify-between mt-7">
              <h3 className="text-xl font-medium">Transactions</h3>
            </div>
            {transactions.map((transaction, index) => {
              return (
                <TransactionItem
                  onDelete={handleDataChange}
                  showDate={(index) => showDate(index)}
                  transaction={transaction}
                  key={index}
                ></TransactionItem>
              );
            })}
          </div>
        </div>
        <AddTranferModal
          defaultWalletId={walletId}
          isOpen={showTransfer}
          onClose={() => setShowTransfer(false)}
          onSuccess={handleDataChange}
        ></AddTranferModal>
        <AddTransanctionModal
          defaultWalletId={walletId}
          isOpen={showTransaction}
          onClose={() => setShowTransaction(false)}
          onSuccess={handleDataChange}
        ></AddTransanctionModal>
      </main>
    </>
  );
};
