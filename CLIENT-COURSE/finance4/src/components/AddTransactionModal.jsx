import { useEffect, useState } from "react";
import { categoryApi } from "../api/category";
import { walletApi } from "../api/wallet";
import { currencyApi } from "../api/currency";
import { transactionApi } from "../api/transaction";
import AlertError from "../utils/AlertError";

export default AddTransactionModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultWalletId,
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [errors, setErrors] = useState([]);
  const [form, setForm] = useState({
    wallet_id: "",
    category_id: "",
    amount: "",
    date: "",
    note: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    try {
      await transactionApi.store({ ...form, amount: parseInt(form.amount) });
      onSuccess();
      onclose();
    } catch (e) {
      setErrors(parseErrors(e.response?.data?.errors) || ["terjadi kesalahan"]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(async () => {
    const data = await categoryApi.index();
    setCategories(data.data.data);
    const data2 = await walletApi.index();
    setWallets(data2.data.wallets);
  }, [isOpen]);

  useEffect(() => {
    setForm({
      wallet_id: defaultWalletId || "",
      category_id: "",
      amount: "",
      date: getToday(),
      note: "",
    });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal is-open"
        onClick={(e) => e.target == e.currentTarget && onClose()}
      >
        <div className="modal-header">
          <div />
          <h3 className="text-lg">Add Transaction</h3>
          <button className="modal-close" onClick={() => onClose()}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form action method="POST" className="flex flex-col gap-6">
            <AlertError messages={errors}></AlertError>
            <div className="rounded-xl overflow-hidden">
              <select
                name="wallet_id"
                id="wallet_id"
                className="form-input"
                onChange={handleChange}
                value={form.wallet_id}
              >
                <option value disabled>
                  Select Wallet
                </option>
                {wallets.map((wallet) => {
                  return (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  );
                })}
              </select>
              <br></br>
              <select
                name="category_id"
                id="category_id"
                className="form-input"
                onChange={handleChange}
                value={form.category_id}
              >
                <option value disabled>
                  Select Category
                </option>
                <optgroup label="EXPENSE">
                  {categories.filter((category) => {
                    if (category.type == "EXPENSE") {
                      return (
                        <option key={category.id} value={category.id}>
                         {category.icon} - {category.name}
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
                         {category.icon} - {category.name}
                        </option>
                      );
                    }
                  })}
                </optgroup>
              </select>
              <input
                type="number"
                id="amount"
                name="amount"
                className="form-input"
                placeholder=" amount"
                required
                onChange={handleChange}
                value={form.amount}
              />
              <input
                type="date"
                id="date"
                name="date"
                className="form-input"
                onChange={handleChange}
                value={form.date}
                min={1}
                required
              ></input>
              <textarea
                id="note"
                onChange={handleChange}
                value={form.note}
                name="note"
                className="form-input"
                rows={3}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-lg w-full mt-4">
              {loading ? "saving..." : "save"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
