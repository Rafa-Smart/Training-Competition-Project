import {
  ArcElement,
  Chart,
  DoughnutController,
  Legend,
  Tooltip,
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useInfinite from "../hooks/useInfinite";

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);
const YEARS = Array.from({ length: 16 }, (_, i) => 2015 + i);

// nah untuk whereMonth yag ada di laravle itu ngecekna angka ya misal bulan jan itu 1 tahu juga pake angka
const MONTH = ["Jan", "Feb", "Mar"];

export default WalletDetail = () => {
  const { walletId } = useParams();
  const [wallet, setwallet] = useState({});
  const { loadingWallet, setLoadingWallet } = useState(false);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showWallet, setShowWallet] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [editName, setEditName] = useState(wallet.name);
  const [isEditName, setIsEditName] = useState(false);
  const [expenseRef, setExpenseRef] = useRef(null);
  const [incomeRef, setIncomeRef] = useRef(null);
  const [expenseInstanceRef, setExpenseInstanceRef] = useRef(null);
  const [incomeInstanceRef, setIncomeInstanceRef] = useRef(null);
  const navigate = useNavigate();

  const fetchWallet = async () => {
    setLoadingWallet(true);
    try {
      const data = useState();
      setwallet(data.data.data);
    } catch (e) {
      alert(e);
    } finally {
      setLoadingWallet(false);
    }
  };
  useEffect(() => {
    fetchWallet();
  }, [walletId]);

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

  useEffect(async () => {
    if (!wallet) return;
    try {
      const data = useState();
      const summary = data.data.summary;
      renderChart(expenseRef, expenseInstanceRef, summary, "EXPENSE");
    } catch (e) {
      alert("gagal ambil sumary expense");
    }
    try {
      const data = useState();
      const summary = data.data.summary;
      renderChart(incomeRef, incomeInstanceRef, summary, "INCOME");
    } catch (e) {
      alert("gagal ambil sumary income");
    }
  }, [selectedMonth, selectedYear, walletId]);

  const handleDataChange = () => {
    loadMore();
    fetchWallet();
  };

  const renderChart = (canvasRef, instanceRef, summary, type) => {
    if (!canvasRef) return;
    if (!summary || summary.length <= 0) return;
    if (instanceRef.current) instanceRef.current.destroy();

    const labels = summary.map((e) => `${e.category.icon} ${e.category.name}`);
    const data = summary.map((e) => e.amount);
    const colors = summary.map((e) => e.category.color || "black");

    instanceRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: "black",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "red",
              padding: 10,
              font: { size: 2 },
            },
          },
        },
      },
    });
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

  const handleNameClick = () => setEditName(true);
  const handleEditName = async () => {
    if (!e.key == " Enter") return;

    const name = editName.trim();
    if (name == "") {
      const confirmed = window.confirm("apus ?");
      if (confirmed) {
        function hapus() {}
        await hapus();
        navigate("/");
      }
    } else {
      try {
        function edit(id, data) {}
        await edit(walletId, editName);
        setwallet((prev) => ({ ...wallet, name: name }));
        setIsEditName(false);
      } catch (e) {
        alert(e);
      }
    }
  };

  return (
    <>
      <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
  <div className="flex items-center gap-3.5">
    <a href="index.html" className="btn btn text-lg! aspect-[1/1] inline-flex! bg-transparent! p-3.5! border border-slate-700 items-center justify-center leading-[1]">
      ←
    </a>
    {isEditName ? (
            <input
              type="text"
              value={editName}
              onKeyDown={handleEditName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => {
                setIsEditName(false);
                setEditName(wallet.name)
              }}
              className="text-2xl font-semibold"
            ></input>
          ) : (
            <h2 onClick={handleNameClick} className="text-2xl font-semibold">{wallet.name}</h2>
          )}
  </div>
  <div className="w-full max-w-[700px] mx-auto">
    <div className="pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
      <div>
        <h2 className="text-lg text-slate-400 font-medium mb-1">
          Total balance
        </h2>
        <div className="font-semibold line-clamp-1 text-4xl">
          Rp 2.500.000
        </div>
      </div>
      <div className="flex items-center gap-3">
        <a href className="btn">
          Transfer Money
        </a>
        <a href className="btn">
          Add Transaction
        </a>
      </div>
    </div>
    <div className="w-full py-2">
      <div className="grid grid-cols-[auto_1fr] items-center mb-5 border-b border-slate-700">
        <div className="overflow-hidden rounded-tl-lg rounded-tr-lg">
          <select className="form-input">
            <option value={2025}>2025</option>
          </select>
        </div>
        <div className="flex overflow-x-auto h-full">
          <a href className="whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg opacity-50">
            Jan
          </a>
          <a href className="whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg bg-slate-800">
            Feb
          </a>
          <a href className="whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg opacity-50">
            Mar
          </a>
          <a href className="whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg opacity-50">
            Jun
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-10 py-6">
        <div className="flex flex-col items-center gap-5">
          <h2 className="text-lg">EXPENSE</h2>
        </div>
        <div className="flex flex-col items-center gap-5">
          <h2 className="text-lg">INCOME</h2>
        </div>
      </div>
      <div className="flex items-center justify-between mt-7">
        <h3 className="text-xl font-medium">Transactions</h3>
      </div>
      <div className="cursor-pointer flex lg:items-center justify-between border-b border-slate-700 py-3 lg:py-4 gap-3 text-lg">
        <div className="flex lg:items-center gap-3">
          <div className="aspect-[1/1] h-[40px] flex items-center justify-center bg-red-200 border-2 border-red-300 rounded-full">
            Icon
          </div>
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
              <div className="font-medium">Category</div>
              <div className="text-slate-400 text-sm lg:text-[1rem]">
                Wallet name
              </div>
            </div>
            <div className="text-slate-400 text-xs lg:text-sm">
              Note (optional)
            </div>
          </div>
        </div>
        <div className="amount font-medium">Rp 250.000</div>
      </div>
      <div className="cursor-pointer flex lg:items-center justify-between border-b border-slate-700 py-3 lg:py-4 gap-3 text-lg">
        <div className="flex lg:items-center gap-3">
          <div className="aspect-[1/1] h-[40px] flex items-center justify-center bg-red-200 border-2 border-red-300 rounded-full">
            Icon
          </div>
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
              <div className="font-medium">Category</div>
              <div className="text-slate-400 text-sm lg:text-[1rem]">
                Wallet name
              </div>
            </div>
            <div className="text-slate-400 text-xs lg:text-sm">
              Note (optional)
            </div>
          </div>
        </div>
        <div className="amount font-medium">-Rp 250.000</div>
      </div>
    </div>
  </div>
</main>

    </>
  );
};
