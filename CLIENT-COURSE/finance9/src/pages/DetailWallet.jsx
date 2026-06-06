import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { walletApi } from "../api/wallet";
import  Chart from "chart.js/auto";
import { formatCurrency } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddTransaction from "../components/AddTransaction";
import Transfer from "../components/Transfer";
import { reportApi } from "../api/report";
const years = Array.from({ length: 16 }, (_, i) => 2015 + i);
const months = [
  "Jan",
  "Feb",
  "Mar",
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
const DetailWallet = () => {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const today = new Date();
  const [wallet, setWallet] = useState({});
  const [editName, setEditName] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [loadingWallet, setLoadingWallet] = useState(false);

  const [showTransaction, setShowTransaction] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const [transactions, page, loading, hasMore, loadMore, reload] =
    useInfiniteScroll({
      month: selectedMonth,
      year: selectedYear,
      wallet_id: walletId,
    });

  const expenseRef = useRef();
  const incomeRef = useRef();
  const expenseInstanceRef = useRef();
  const incomeInstanceRef = useRef();

  const handleClickEdit = async (e) => {
    // const name = editName.trim();
    if (e.key != "Enter") return;
    if (editName.trim() == "") {
      // hapus
      try {
        await walletApi.destroy(walletId);
        navigate("/");
      } catch (e) {
        alert("gagal delete");
      }
    } else {
      // update
      try {
        await walletApi.update({ name: editName }, walletId);
        setWallet((prev) => ({ ...prev, name: editName }));
        setIsEdit(false);
      } catch (e) {
        alert("gagal update");
      }
    }
    handleDataChange();
  };
  const loadWallet = () => {
    // console.log("asdasdd"); className
    setLoadingWallet(true);
    walletApi
      .show(walletId)
      .then((response) => {
        setWallet(response.data.data);
        setEditName(response.data.data.name);
      })
      .catch((e) => alert(e))
      .finally(() => setLoadingWallet(false));
  };
  useEffect(() => {
    loadWallet();
    reload();
  }, [walletId]);

  useEffect(() => {
    loadWallet();
    reload();
    loadMore(1, true);
  }, [selectedMonth, selectedYear, walletId]);
  const handleDataChange = () => {
    reload();
    loadWallet();
    loadMore(1, true);
  };

  const showDate = (index) => {
    if (index == 0) return true;
    return transactions[index].date != transactions[index - 1].date;
  };

  useEffect(() => {  console.log(expenseRef.current);
  console.log(incomeRef.current);
    reportApi.expense().then((response) => {
      const summary = response.data.data.summary;
      console.log(summary)
      renderChart(expenseRef, expenseInstanceRef, summary, "EXPENSE");
    });
    reportApi.income().then((response) => {
      const summary = response?.data?.data?.summary;
      renderChart(incomeRef, incomeInstanceRef, summary, "INCOME");
    });

    return () => {
      expenseInstanceRef.current?.destroy();
      incomeInstanceRef.current?.destroy();
    };
  }, [selectedMonth, selectedYear, walletId]);

  const renderChart = (ref, instanceRef, summary, type) => {
    if (!ref.current) return;
    if (instanceRef.current) {
      instanceRef.current.destroy();
    }
    if (!summary || !summary.length) return;

    const data = summary.map((s) => Number(s.amount));
    const labels = summary.map((e) => `${e.category.icon} ${e.category.name}`);
    const colors = summary.map((e) => e.category.color || "gray");
console.log('sebelum')
instanceRef.current = new Chart(ref.current, {
  type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#ff8800",
  "#88ff00",
  "#0088ff",
  "#8800ff",
],
            borderWidth: 3,
            borderColor: "black",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "red", padding: 4, font: { size: 14 } },
          },
        },
      },
    });
    console.log('sesudah')
  };

  if (loadingWallet)
    return (
      <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <span className="loading"></span>
      </main>
    );
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
          {isEdit ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleClickEdit}
              onBlur={() => {
                setIsEdit(false);
                setEditName(editName);
              }}
              className="text-2xl font-semibold"
            ></input>
          ) : (
            <h2
              onClick={() => setIsEdit(true)}
              className="text-2xl font-semibold"
            >
              {editName}
            </h2>
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
              <div className="overflow-hidden rounded-tl-lg rounded-tr-lg">
                <select
                  value={selectedYear}
                  className="form-input"
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((year, index) => {
                    return (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex overflow-x-auto h-full">
                {months.map((month, index) => {
                  return (
                    <button
                      key={index}
                      onClick={(e) => setSelectedMonth(index + 1)}
                      className={`whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg ${index + 1 == selectedMonth ? "opacity-100" : "opacity-50"}`}
                    >
                      {month}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 py-6">
              <div className="flex flex-col items-center gap-5">
                <h2 className="text-lg">EXPENSE</h2>
                <canvas ref={expenseRef} width={300} height={300}  style={{
    border: "1px solid red"
  }}></canvas>
              </div>
              <div className="flex flex-col items-center gap-5">
                <h2 className="text-lg">INCOME</h2>
                <canvas ref={incomeRef} width={300} height={300}  style={{
    border: "1px solid red"
  }}></canvas>
              </div>
            </div>

            <div className="flex items-center justify-between mt-7">
              <h3 className="text-xl font-medium">Transactions</h3>
            </div>
            {transactions &&
              transactions.map((transaction, index) => {
                return (
                  <TransactionItem
                    onDelete={handleDataChange}
                    showDate={showDate(index)}
                    transaction={transaction}
                    key={index}
                  ></TransactionItem>
                );
              })}
            {loading && hasMore && <span className="loading"></span>}
            {!loading && transactions.length == 0 && <h3>kosong</h3>}
            {!loading && hasMore && <p onClick={() => loadMore()}>LoadMore</p>}
          </div>
        </div>
        <AddTransaction
          isOpen={showTransaction}
          defaultId={walletId}
          onClose={() => setShowTransaction(false)}
          onSuccess={handleDataChange}
        ></AddTransaction>
        <Transfer
          defaultId={walletId}
          isOpen={showTransfer}
          onClose={() => setShowTransfer(false)}
          onSuccess={handleDataChange}
        ></Transfer>
      </main>
    </>
  );
};

export default DetailWallet;
