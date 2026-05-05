import { useCallback, useEffect, useRef, useState } from "react";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArcElement,
  Chart,
  DoughnutController,
  Legend,
  Tooltip,
} from "chart.js";
import { walletApi } from "../api/wallet";
import { transactionApi } from "../api/transaction";
import { reportApi } from "../api/report";

Chart.register(Tooltip, Legend, ArcElement, DoughnutController);
const MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const YEAR = new Array.from({ length: 16 }, (_, index) => 2015 + index);

export default WalletDetail = () => {
  const { walletId } = useParams();
  const [wallet, setWallet] = useState([]);
  const [loadingWallet, setLoadingwallet] = useState(false);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [transactions, loadMore, loading, hasMore, fetchTransaction, reload] =
    useInfiniteScroll({
      wallet_id: walletId,
      month: selectedMonth,
      year: selectedYear,
    });

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameEdit, setNameEdit] = useState("");

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const [expenseChartRef, setExpenseChartRef] = useRef(null);
  const [incomeChartRef, setIncomeChartRef] = useRef(null);

  const [expenseChartInstance, setExpenseChartInstance] = useRef(null);
  const [incomeChartInstance, setIncomeChartInstance] = useRef(null);

  const navigate = useNavigate();

  const loadWallet = useCallback(async () => {
    setLoadingwalleT(true);
    try {
      const data = await walletApi.show(walletId);
      setWallet(data.data.data);
    } catch (e) {
      navigate("/");
    } finally {
      setLoadingwallet(false);
    }
  }, [walletId, navigate]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  //   nah dia akn otomatis fetch ulang kalo misalnya ad ayang ganti dan berubah antara selected month, year dan juga walletId

  useEffect(() => {
    fetchTransaction(1, true);
  }, [walletId, selectedMonth, selectedYear]);

  // nah kita bua fungsi untuk render canvasnya ya

  useEffect(async () => {
    if (!wallet) return;

    // jadi kalo ada walletnya maka kita akn render si chartnya
    const summaryExpense = await reportApi.summaryExpense({
      month: selectedMonth,
      year: selectedYear,
    });
    const summary = summaryExpense.data.summary;
    renderChart(expenseChartRef, expenseChartInstance, summary, "Expense");

    const summaryIncome = await reportApi.summaryIncome({
      month: selectedMonth,
      year: selectedYear,
    });
    const summary = summaryIncome.data.summary;
    renderChart(incomeChartRef, incomeChartInstance, summary, "INCOME");
  }, [selectedMonth, selectedYear, wallet]);

  const renderChart = (canvasRef, chartInstance, summary, label) => {
    if (!canvasRef.current) return;
    // nah ini aklo udha ada maka kita hapus dulu biar engga
    // numpuk
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    if (!summary || summary.length === 0) return;
    const labels = summary.map((s) => `${s.category.icon} ${s.category.name}`);
    const data = summary.map((s) => s.amount);
    const colors = summary.map((s) => s.category.color || "#64748b");

    chartInstance.current = new Chart(canvasRef, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: "#1e293b",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94a3b8", padding: 10, font: { size: 11 } },
          },
        },
      },
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "n") {
        e.preventDefault();
        setShowAddTransaction(true);
      }
      if (e.altKey && e.key === "t") {
        e.preventDefault();
        setShowTransfer(true);
      }
      if (e.key === "Escape") {
        setShowAddTransaction(false);
        setShowTransfer(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNameClick = () => {
    setIsEditingName(true);
  };

  const handleNameKeyDown = async (e) => {
    // pokonya hanya brelaku kalo misalnya itu kita klik enter ya
    if (!e.key == "Enter") return;

    const name = nameEdit.trim();

    if (name == "") {
      // kalo kosong tu berati di hapus ya inget

      const confirmed = window.confirm("apalkah mau hapus name");
      if (confirmed) {
        try {
          await walletApi.destroy(walletId);
          navigate("/"); // Balik ke overview setelah hapus
        } catch (e) {
          alert("gagal hapus wallet");
        }
        return;
      }
    } else {
      // kalo engga maka berati kita edit ya
      try {
        await walletApi.put(walletId, nameEdit);

        // kita ubah nama dari detail wallet ini ya
        setWallet((prev) => ({ ...prev, name: nameEdit }));
      } catch (e) {
        alert("gagal edit nama wallet");
      }
    }
    setIsEditingName(false);
  };


  const handleDataChange = ()=> {
    loadWallet();
    fetchTransaction(1, true)
  }
  const showDate = (index) =>{
    if(index == 0)return ;
    return transactions[index] != transactions[index-1];
  }

  return (
    <>
      <main class="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div class="flex items-center gap-3.5">
          <Link to='/'
            class="btn btn text-lg! aspect-[1/1] inline-flex! bg-transparent! p-3.5! border border-slate-700 items-center justify-center leading-[1]"
          >
            ←
          </Link>
          <h2 class="text-2xl font-semibold">Wallet Name</h2>
        </div>

        <div class="w-full max-w-[700px] mx-auto">
          <div class="pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <h2 class="text-lg text-slate-400 font-medium mb-1">
                Total balance
              </h2>
              <div class="font-semibold line-clamp-1 text-4xl">
                Rp 2.500.000
              </div>
            </div>
            <div class="flex items-center gap-3">
              <a href="" class="btn">
                Transfer Money
              </a>
              <a href="" class="btn">
                Add Transaction
              </a>
            </div>
          </div>

          <div class="w-full py-2">
            <div class="grid grid-cols-[auto_1fr] items-center mb-5 border-b border-slate-700">
              <div class="overflow-hidden rounded-tl-lg rounded-tr-lg">
                <select class="form-input">
                  <option value="2025">2025</option>
                </select>
              </div>
              <div class="flex overflow-x-auto h-full">
                <a
                  href=""
                  class="whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg opacity-50"
                >
                  Jan
                </a>
                <a
                  href=""
                  class="whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg bg-slate-800"
                >
                  Feb
                </a>
                <a
                  href=""
                  class="whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg opacity-50"
                >
                  Mar
                </a>
                <a
                  href=""
                  class="whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg opacity-50"
                >
                  Jun
                </a>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-10 py-6">
              <div class="flex flex-col items-center gap-5">
                <h2 class="text-lg">EXPENSE</h2>
              </div>
              <div class="flex flex-col items-center gap-5">
                <h2 class="text-lg">INCOME</h2>
              </div>
            </div>

            <div class="flex items-center justify-between mt-7">
              <h3 class="text-xl font-medium">Transactions</h3>
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
        </div>
      </main>
    </>
  );
};
