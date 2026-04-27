// ============================================================
// FILE: src/pages/WalletDetail.jsx
// FUNGSI: Halaman detail satu wallet tertentu.
// PATH: /wallets/:walletId
//
// TEMPLATE YANG DIPAKAI:
// Ambil dari template "wallet-detail.html" yang diberikan.
// Strukturnya:
//   - Tombol back (←) + Nama wallet (bisa diklik untuk edit/hapus)
//   - Total balance
//   - Tombol "Transfer Money" dan "Add Transaction"
//   - Selector tahun + selector bulan (tab horizontal)
//   - Doughnut chart (expense kiri, income kanan)
//   - Daftar transaksi bulan tersebut
//
// FITUR KHUSUS:
// 1. Edit nama wallet: klik nama → jadi input → tekan Enter untuk save
//    Kalau input dikosongkan → tekan Enter → muncul konfirmasi hapus wallet
// 2. Doughnut chart dari Chart.js (expense dan income terpisah)
// 3. Filter transaksi berdasarkan bulan dan tahun
// 4. Semua keyboard shortcut: Alt+N (add), Alt+T (transfer), Esc (tutup modal)
//
// KEYBOARD SHORTCUTS:
// - Alt+N → buka Add Transaction modal (wallet otomatis terisi)
// - Alt+T → buka Transfer modal (wallet asal otomatis terisi)
// - Esc   → tutup modal
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
} from "chart.js";
import { getWalletDetail, updateWallet, deleteWallet } from "../api/wallets";
import { getExpenseSummary, getIncomeSummary } from "../api/reports";
import { useInfiniteTransactions } from "../context/hooks/useInfiniteTransactions";
import { formatCurrency, formatDate } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddTransactionModal from "../components/AddTransactionModal";
import TransferModal from "../components/TransferModal";

// Daftarkan modul Chart.js yang dipakai
Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

// Helper: buat array tahun 2015-2030 untuk selector
const YEARS = Array.from({ length: 16 }, (_, i) => 2015 + i);

// Helper: nama bulan singkat
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function WalletDetail() {
  const { walletId } = useParams(); // Ambil ID wallet dari URL
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  // State untuk filter bulan dan tahun
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12

  // State untuk edit nama wallet
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  // State untuk modal
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  // Ref untuk canvas chart (Chart.js butuh elemen canvas)
  const expenseChartRef = useRef(null);
  const incomeChartRef = useRef(null);
  const expenseChartInstance = useRef(null);
  const incomeChartInstance = useRef(null);

  // Hook transaksi dengan filter wallet + bulan + tahun
  // const { transactions, loading: txLoading, hasMore, loadMore, reload, fetchPage } =
  //   useInfiniteTransactions({
  //     // Catatan: Backend GET /transactions tidak ada filter wallet_id,
  //     // jadi kita filter di sisi client setelah fetch
  //   });

  const {
    transactions,
    loading: txLoading,
    hasMore,
    loadMore,
    fetchPage,
  } = useInfiniteTransactions({
    wallet_id: walletId,
    month: selectedMonth,
    year: selectedYear,
  });

  // Ambil data wallet
  const loadWallet = useCallback(() => {
    setLoading(true);
    getWalletDetail(walletId)
      .then((res) => {
        setWallet(res.data.data);
        setEditName(res.data.data.name);
      })
      .catch(() => navigate("/")) // Wallet tidak ditemukan → kembali ke overview
      .finally(() => setLoading(false));
  }, [walletId, navigate]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  // Ambil transaksi saat wallet/bulan/tahun berubah
  useEffect(() => {
    fetchPage(1, true); // reset + fetch ulang
  }, [walletId, selectedMonth, selectedYear]);

  // 🔥 Tidak perlu filter lagi karena backend sudah filter berdasarkan wallet_id, month, year
  const filteredTransactions = transactions; // alias untuk mempertahankan nama variabel

  // Ambil dan render chart
  useEffect(() => {
    if (!wallet) return;

    getExpenseSummary({ month: selectedMonth, year: selectedYear })
      .then((res) => {
        const summary = res.data.data.summary;
        renderChart(expenseChartRef, expenseChartInstance, summary, "Expense");
      })
      .catch(() => {});

    getIncomeSummary({ month: selectedMonth, year: selectedYear })
      .then((res) => {
        const summary = res.data.data.summary;
        renderChart(incomeChartRef, incomeChartInstance, summary, "Income");
      })
      .catch(() => {});
  }, [selectedMonth, selectedYear, wallet]);

  // Fungsi render/update chart dengan Chart.js
  const renderChart = (canvasRef, chartInstance, summary, label) => {
    if (!canvasRef.current) return;

    // Destroy chart lama supaya tidak double
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!summary || summary.length === 0) return;

    const labels = summary.map((s) => `${s.category.icon} ${s.category.name}`);
    const data = summary.map((s) => s.amount);
    const colors = summary.map((s) => s.category.color || "#64748b");

    chartInstance.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
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

  // Keyboard shortcuts
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

  // Klik nama wallet → aktifkan mode edit
  const handleNameClick = () => {
    setIsEditingName(true);
  };

  // Tekan Enter di input nama wallet
  const handleNameKeyDown = async (e) => {
    if (e.key !== "Enter") return;

    const name = editName.trim();

    if (name === "") {
      // Nama dikosongkan → konfirmasi hapus wallet
      const confirmed = window.confirm(
        `Hapus wallet "${wallet.name}"? Semua transaksi di dalamnya juga akan terhapus.`,
      );
      if (confirmed) {
        try {
          await deleteWallet(walletId);
          navigate("/"); // Balik ke overview setelah hapus
        } catch {
          alert("Gagal menghapus wallet.");
        }
      }
      return;
    }

    // Nama tidak kosong → update nama wallet
    try {
      await updateWallet(walletId, { name });
      setWallet((prev) => ({ ...prev, name }));
      setIsEditingName(false);
    } catch {
      alert("Gagal mengupdate nama wallet.");
    }
  };

  // Setelah add/hapus transaksi → refresh wallet + transaksi
  const handleDataChange = () => {
    loadWallet();
    fetchPage(1, true);
  };

  const shouldShowDate = (index) => {
    if (index === 0) return true;
    return (
      filteredTransactions[index].date !== filteredTransactions[index - 1].date
    );
  };

  if (loading) {
    return (
      <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <div className="text-center text-slate-400 py-20">Loading...</div>
      </main>
    );
  }

  return (
    <>
      <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        {/* === HEADER: Tombol back + nama wallet === */}
        <div className="flex items-center gap-3.5">
          <Link
            to="/"
            className="btn text-lg! aspect-[1/1] inline-flex! bg-transparent! p-3.5! border border-slate-700 items-center justify-center leading-[1]"
          >
            ←
          </Link>
          {/* Nama wallet: klik untuk edit */}
          {isEditingName ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={() => {
                setIsEditingName(false);
                setEditName(wallet.name);
              }}
              className="form-input text-2xl font-semibold bg-transparent border-b border-slate-600 outline-none"
              autoFocus
            />
          ) : (
            <h2
              className="text-2xl font-semibold cursor-pointer hover:text-green-400 transition-colors"
              onClick={handleNameClick}
              title="Klik untuk edit nama. Kosongkan lalu Enter untuk hapus wallet."
            >
              {wallet?.name}
            </h2>
          )}
        </div>

        <div className="w-full max-w-[700px] mx-auto">
          {/* === BALANCE + TOMBOL AKSI === */}
          <div className="pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <h2 className="text-lg text-slate-400 font-medium mb-1">
                Total balance
              </h2>
              <div className="font-semibold line-clamp-1 text-4xl">
                {formatCurrency(wallet?.balance || 0, wallet?.currency_code)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowTransfer(true)} className="btn">
                Transfer Money
              </button>
              <button
                onClick={() => setShowAddTransaction(true)}
                className="btn"
              >
                Add Transaction
              </button>
            </div>
          </div>

          {/* === FILTER TAHUN + BULAN === */}
          <div className="w-full py-2">
            <div className="grid grid-cols-[auto_1fr] items-center mb-5 border-b border-slate-700">
              {/* Dropdown tahun */}
              <div className="overflow-hidden rounded-tl-lg rounded-tr-lg">
                <select
                  className="form-input"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tab bulan horizontal scrollable */}
              <div className="flex overflow-x-auto h-full">
                {MONTHS.map((month, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMonth(idx + 1)}
                    className={`whitespace-nowrap h-full p-4 rounded-tl-lg rounded-tr-lg transition-colors ${
                      selectedMonth === idx + 1
                        ? "bg-slate-800"
                        : "opacity-50 hover:opacity-75"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            {/* === CHART DOUGHNUT === */}
            <div className="grid grid-cols-2 gap-10 py-6">
              <div className="flex flex-col items-center gap-5">
                <h2 className="text-lg">EXPENSE</h2>
                <canvas ref={expenseChartRef} />
              </div>
              <div className="flex flex-col items-center gap-5">
                <h2 className="text-lg">INCOME</h2>
                <canvas ref={incomeChartRef} />
              </div>
            </div>

            {/* === DAFTAR TRANSAKSI === */}
            <div className="flex items-center justify-between mt-7">
              <h3 className="text-xl font-medium">Transactions</h3>
            </div>

            {filteredTransactions.map((trx, index) => (
              <TransactionItem
                key={trx.id}
                transaction={trx}
                onDelete={handleDataChange}
                showDate={shouldShowDate(index)}
              />
            ))}

            {txLoading && (
              <div className="text-center text-slate-400 py-4">Loading...</div>
            )}

            {!txLoading && filteredTransactions.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                Tidak ada transaksi di bulan ini.
              </div>
            )}

            {hasMore && !txLoading && (
              <button
                onClick={loadMore}
                className="w-full py-3 text-slate-400 hover:text-white text-sm mt-2"
              >
                Load More
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Modal Add Transaction — wallet otomatis terisi */}
      <AddTransactionModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSuccess={handleDataChange}
        defaultWalletId={walletId}
      />

      {/* Modal Transfer — wallet asal otomatis terisi */}
      <TransferModal
        isOpen={showTransfer}
        onClose={() => setShowTransfer(false)}
        onSuccess={handleDataChange}
        defaultWalletId={walletId}
      />
    </>
  );
}