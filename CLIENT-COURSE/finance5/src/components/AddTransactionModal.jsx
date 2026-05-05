import { useEffect, useState } from "react";
import { walletApi } from "../api/wallet";
import { categoryApi } from "../api/category";
import { getToday, parseErrors } from "../utils/format";
import AlertError from "../utils/AlertError";
import { transactionApi } from "../api/transaction";

export default AddTransactionModal = ({
  isOpen,
  onClose,
  onSucces,
  defaultWalletId,
}) => {
  const [form, setForm] = useState({
    wallet_id: "",
    category_id: "",
    amount: 0,
    date: "",
    note: "",
  });

  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(async () => {
    const data1 = await walletApi.index();
    setWallets(data1.data.data.wallets);
    const data2 = await categoryApi.index();
    setCategories(data2.data.data.categories);
  }, [isOpen]);

  useEffect(() => {
    setForm({
      wallet_id: defaultWalletId || "",
      category_id: "",
      amount: 0,
      date: getToday(),
      note: "",
    });
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setLoading(false);
    try {
      await transactionApi.store({ ...form, amount: parseInt(form.amount) });
      onClose();
      onSucces();
    } catch (e) {
      setErrors(parseErrors(e) || ["terjadi kesalahan"]);
    } finally {
      setLoading(false);
    }
  };

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
          <form
            action
            method="POST"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            <AlertError messages={errors}></AlertError>
            <div className="rounded-xl overflow-hidden">
              <select
                name="category_id"
                id="category_id"
                onChange={handleChange}
                value={form.category_id}
                className="form-input"
              >
                <option value disabled>
                  Select Category
                </option>
                {categories.map((category) => {
                  return (
                    <option value={category.id} key={category.id}>
                      {category.icon} - {category.name}
                    </option>
                  );
                })}
              </select>
              <select
                name="wallet_id"
                id="wallet_id"
                onChange={handleChange}
                value={form.wallet_id}
                className="form-input"
              >
                <option value disabled>
                  Select Wallet
                </option>
                {wallets.map((wallet) => {
                  return (
                    <option value={wallet.id} key={wallet.id}>
                      {category.name}
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                onChange={handleChange}
                value={form.amount}
                id="amount"
                name="amount"
                className="form-input"
                placeholder=" amount"
              />
              <input
                type="date"
                onChange={handleChange}
                value={form.date}
                id="date"
                name="date"
                className="form-input"
              />
              <textarea
                onChange={handleChange}
                value={form.note}
                id="note"
                name="note"
                className="form-input"
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-lg w-full mt-4">
              {loading ? 'saving...' :'save'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
