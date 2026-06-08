import { useNavigate, useParams } from "react-router";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import Chart, { Legend } from "chart.js/auto";
import { useEffect, useRef, useState } from "react";
import { walletApi } from "../api/wallet";
import { reportApi } from "../api/report";
import { formatCurrency } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddTransaction from "../components/AddTransaction";
import AddWallet from "../components/AddWallet";
const years = Array.from({ length: 16 }, (_, i) => 2015 + i);
const month = [
  "Jan",
  "Feb",
  "Mar",
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
const DetailWallet = () => {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [wallet, setWallet] = useState();
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [editName, setEditName] = useState(wallet.name);
  const [isEdit, setIsEdit] = useState(false);
  const expenseRef = useRef(null);
  const incomeRef = useRef(null);
  const incomeInstance = useRef(null);
  const expenseInstance = useRef(null);
  const [transactions, page, hasMore, loading, loadMore, reload] =
    useInfiniteScroll({
      month: selectedMonth,
      year: selectedYear,
      wallet_id: walletId,
    });

  const loadWallet = async () => {
    setLoadingWallet(true);
    try {
      const response = await walletApi.show(walletId);
      setWallet(response.data.data);
      setEditName(response.data.data.name);
    } catch (e) {
      alert("gagal ambil data wallet detail");
    } finally {
      setLoadingWallet(false);
    }
  };

  const showDate = (index) => {
    if (index == 0) return false;
    return transactions[index].date != transactions[index - 1].date;
  };

  useEffect(() => {
    const click = function (e) {
      if (e.key == "Escape") {
        e.preventDefault();
        setShowWallet(false);
        setShowTransaction(false);
      }
      if (!e.ctrlKey) return;
      if (e.key == "q") {
        e.preventDefault();
        setShowWallet(false);
        setShowTransaction(true);
      }
      if (e.key == "w") {
        e.preventDefault();
        setShowWallet(true);
        setShowTransaction(false);
      }
    };
    window.addEventListener("keydown", click);
    return () => window.removeEventListener("keydown", click);
  }, []);

  const handleDataChange = () => {
    reload();
    loadWallet();
  };

  const handleEdit = (e) => {
    if (editName != "") {
      // edit
      walletApi
        .update(walletId, { ...wallet, name: editName })
        .then((response) => {
          setWallet({ ...wallet, name: editName });
        })
        .catch((e) => alert("gagal edit name"));
    } else {
      // hapus
      const confirmed = confirm("yakin apus ?");
      if (confirmed) {
        // yain apus
        walletApi
          .delete(walletId)
          .then((response) => {})
          .catch((e) => alert("gagal apus wallet"))
          .finally(navigate("/"));
      }
    }
    setEditName(false);
  };

  const renderChart = (ref, instanceRef, summary, type) => {
    if (ref.current) return;
    if (instanceRef.current) {
      instanceRef.current.destroy();
    }
    if (!summary || summary.length <= 0) return;

    const datas = summary.map((s) => s.amount);
    const colors = summry.map((s) => s.category?.color || "yellow");
    const labels = summary.map(
      (s) => `${s.category?.color} ${s.category.name}`,
    );

    instanceRef.current = new Chart(ref, {
      labels: labels,
      data: {
        datasets: [
          {
            backgroundColor: colors,
            borderColor: "black",
            borderWidth: 4,
            data: datas,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "green",
              pading: 10,
              font: {
                size: 10,
              },
            },
          },
        },
      },
    });
  };

  useEffect(() => {
    handleDataChange();
    loadMore();

    // na jadi semua useEffect akan di taruh di sni ya
    if (!wallet) return;

    reportApi
      .expense()
      .then((response) => {
        renderChart(
          expenseRef,
          expenseInstance,
          response.data.summary,
          "EXPENSE",
        );
      })
      .catch((e) => alert("gagal ambil expense"));
    reportApi
      .income()
      .then((response) => {
        renderChart(incomeRef, incomeInstance, summary, "INCOME");
      })
      .catch((e) => alert("gagal abil income"));
  }, [selectedMonth, selectedYear, walletId]);

  return (
    <>
      <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div className="flex items-center gap-3.5">
          <a
            href="index.html"
            className="btn btn text-lg! aspect-[1/1] inline-flex! bg-transparent! p-3.5! border border-slate-700 items-center justify-center leading-[1]"
          >
            ←
          </a>
          {isEdit ? (
            <input
              className="text-2xl font-semibold"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={handleEdit}
            ></input>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">{wallet.name}</h2>
            </>
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
              <a onClick={() => setShowWallet(true)} className="btn">
                Add Transaction
              </a>
            </div>
          </div>

          <div className="w-full py-2">
            <div className="grid grid-cols-[auto_1fr] items-center mb-5 border-b border-slate-700">
              <div className="overflow-hidden rounded-tl-lg rounded-tr-lg">
                <select
                  className="form-input"
                  value={selectedYear}
                  onChange={(e) => selectedYear(Number(e.target.value))}
                >
                  {years.map((y, i) => (
                    <option key={i} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex overflow-x-auto h-full">
                {month.map((m, i) => (
                  <button
                    key={i}
                    onClick={(e) => selectedMonth(i + 1)}
                    className={`whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg ${i + 1 == selectedMonth ? "opacity-100" : "opacity-50"}`}
                  >
                    {m}
                  </button>
                ))}
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
              {transactions &&
                transactions.map((transaction, index) => {
                  return (
                    <TransactionItem
                      onDelete={handleChange}
                      showDate={() => showDate(index)}
                      transaction={transaction}
                      key={index}
                    ></TransactionItem>
                  );
                })}
              {loading && hasMore && <>Loading...</>}
              {!loading && transactions.length == 0 && <>Kosong</>}
              {!loading && hasMore && (
                <div onClick={() => loadMore()}>Load More</div>
              )}
            </div>
          </div>
        </div>

        <AddTransaction
          defaultId={null}
          isOpen={showTransaction}
          onClose={() => setShowTransaction(false)}
          onSuccess={handleChange}
        ></AddTransaction>
        <AddWallet
          defaultId={null}
          isOpen={showWallet}
          onClose={() => setShowWallet(false)}
          onSuccess={handleChange}
        ></AddWallet>
      </main>
    </>
  );
};

export default DetailWallet;