import { useEffect, useState } from "react";
import { getToday, parseErrors } from "../utils/format";
import { walletApi } from "../api/wallet";
import { categoryApi } from "../api/category";
import { transactionApi } from "../api/transaction";
import AlertError from "../utils/AlertError";

export default AddTransactionModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultWalletId,
}) => {
  const [form, setForm] = useState({
    wallet_id: "",
    category_id: "",
    amount: 0,
    date: "",
    note: "",
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    setForm({
      wallet_id: defaultWalletId || "",
      category_id: "",
      amount: 0,
      date: getToday(),
      note: "",
    });
    setErrors([]);
  }, [isOpen]);

  useEffect(async () => {
    const data = await walletApi.index();
    setWallets(data.data.data);
    const t = await categoryApi.index();
    setCategories(t.data.data.categories);
  }, [isOpen]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      await transactionApi.store({ ...form, amount: parseInt(amount) });
      onClose();
      onSuccess();
    } catch (e) {
      setErrors(parseErrors(e) || ["terjadi kesalahan"]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        class="modal is-open"
        onClick={(e) => e.target == e.currentTarget && onClose()}
      >
        <div class="modal-header">
          <div></div>
          <h3 class="text-lg">Add Transaction</h3>
          <button class="modal-close" onClick={() => onClose()}>
            ×
          </button>
        </div>
        <div class="modal-body">
          <form
            action=""
            onSubmit={handleSubmit}
            method="POST"
            class="flex flex-col gap-6"
          >
          <AlertError messages={errors}></AlertError>
            <div class="rounded-xl overflow-hidden">
              <select
                name="wallet_id"
                onChange={handleChange}
                value={form.wallet_id}
                id="wallet_id"
                class="form-input"
              >
                <option value="" disabled>
                  Select Wallets
                </option>
                {wallets.map((wallet, index) => {
                  <option key={index} value={wallet.id}>
                    {wallet.name} {wallet.currency_code}
                  </option>;
                })}
              </select>
              <select
                name="category_id"
                onChange={handleChange}
                value={form.category_id}
                id="category_id"
                class="form-input"
              >
                <option value="" disabled>
                  Select Categories
                </option>
                <optgroup label="EXPENSE">
                  {categories.map((category, index) => {
                    if (category.type == "EXPENSE") {
                      return (
                        <option value={category.id} key={index}>
                          {category.icon} - {category.name}
                        </option>
                      );
                    }
                  })}
                </optgroup>
                <optgroup label="INCOME">
                  {categories.map((category, index) => {
                    if (category.type == "INCOME") {
                      return (
                        <option value={category.id} key={index}>
                          {category.icon} - {category.name}
                        </option>
                      );
                    }
                  })}
                </optgroup>
              </select>
              <input
                onChange={handleChange}
                value={form.amount}
                type="number"
                id="amount"
                name="amount"
                class="form-input"
                placeholder="amount"
              />
              <input
                onChange={handleChange}
                value={form.date}
                type="date"
                id="date"
                name="date"
                class="form-input"
              />
              <textarea
                onChange={handleChange}
                value={form.note}
                id="note"
                name="note"
                class="form-input"
                rows={3}
              />
            </div>

            <button type="submit" class="btn btn-lg w-full mt-4">
              {loading ? "saving..." : "save"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
