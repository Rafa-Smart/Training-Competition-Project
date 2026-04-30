// NAH JADI DINSI ITU KITA PUNYA WALLET DEFAULT ID KARENA KALO MISALNYA

import { useEffect, useState } from "react";
import { categoryApi } from "../api/category";
import { walletApi } from "../api/wallet";
import { transactionApi } from "../api/transaction";
import { parseErrors } from "../utils/format";
import Alert from "../utils/Alert";

// KITA KLIK BUTTON TRANSAKSI LEWAT WALLET MAKA KNA ADA ALNGSUNG WALLET ID NYA DARI SI WALLET INI, DAN KALO KITA KLIK TRANSAKSI DARI OVERVIEW ITU AKN GA ARI WALET BERATI NATI WALLET DEFAULT IDNYA OSONG DAN HAUS ISI AJA MANUAL
export default AddTransactionModal = ({
  isOpen,
  isClose,
  onSuccess,
  defaultWalletId,
}) => {
  const [form, setForm] = useState({
    wallet_id: "",
    category_id: "",
    amount: "sad",
    date: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);

  useEffect(async () => {
    const data = await categoryApi.index();
    setCategories(data.data?.data?.categories);

    // ambil wallet
    const wallet = await walletApi.index();
    setWallets(wallet.data?.data?.wallets);
  }, [isOpen]);

  useEffect(() => {
    setForm({
      wallet_id: defaultWalletId || "", // Auto-select wallet jika dari WalletDetail
      category_id: "",
      amount: "sad",
      date: "",
      note: "",
    });
    setErrors([]);
  }, [isOpen, defaultWalletId]);

  const handleChange = (e) => {
    setForm({ ...prevData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);
    setErrors([]);
    try {

      

      // nah disni jangna lupa ya karea laravel ita itu mintanya si amount adalh integer maka kit aubah aa dulu ke integer
      await transactionApi.store({ ...form, amount: parseInt(form.amount) });
      onSuccess();
      onclose();
    } catch (e) {
      setErrors(
        parseErrors(e.data?.response?.errors) || ["error nambah transaksi"],
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal is-open"
        onClick={e.target == e.currentTarget && onclose()}
      >
        <div className="modal-header">
          <div />
          <h3 className="text-lg">Add Transction</h3>
          <button className="modal-close" onClick={() => onclose()}>×</button>
        </div>
        <div className="modal-body">

          <form action method="POST" className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Alert messages={errors}></Alert>
            <div className="rounded-xl overflow-hidden">
            <select name="wallet_id" onChange={handleChange} className="form-input">
                <option value={wallet.id}>{wallet.id}</option>
                {
                    wallets.map((wallet) => {
                        return <option value={wallet.id} key={wallet.id}>{wallet.currency_code} {wallet.name}</option>
                    })
                }
            </select>

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                id="category_id"
                className="form-input"
              >
                <option value={''} disabled>
                  Select categories
                </option>

                {/* nah ini dia yang kerenya */}
                {/* kita bis pake kaya sub gitu */}
                <optgroup label="EXPENSE">
                  {categories.map((category) => {
                    if (category.type == "EXPENSE") {
                      return (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      );
                    }
                  })}
                </optgroup>
                <optgroup label="INCOME">
                  {categories.map((category) => {
                    if (category.type == "INCOME") {
                      return (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      );
                    }
                  })}
                </optgroup>
              </select>
              <input
              onChange={handleChange}
                type="number"
                id="name"
                value={value.amount}
                name="amount"
                className="form-input"
                placeholder="amount"
              />
              <input
              value={form.date}
                type="date"
                onChange={handleChange}
                id="name"
                name="date"
                className="form-input"
              />
              <textarea onChange={handleChange} name='note' value={form.note} rows={3} className="form-input"></textarea>
            </div>
            <button type="submit" className="btn btn-lg w-full mt-4">
               {loading  ? "submiting":"submit"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
