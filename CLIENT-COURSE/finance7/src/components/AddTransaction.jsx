import { useEffect, useState } from "react";
import { transactionApi } from "../api/transaction";
import { walletApi } from "../api/wallet";
import { categoryApi } from "../api/category";
import { getToday } from "../utils/format";
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
  const [loading, setLoading] = useState(false);
  const [errors, seterrors] = useState([]);
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryApi
      .index()
      .then((e) => setCategories(c.data.data.categories))
      .catch((e) => alert(e));
    walletApi
      .index()
      .then((e) => setWallets(w.data.data))
      .catch((e) => alert(e));
  }, [isOpen]);
  useEffect(async () => {
    setForm({
      ...form,
      amount: parseInt(form.amount),
      date: getToday(),
      wallet_id: defaultWalletId,
    });
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    try {
      await transactionApi.store({ ...form, amount: parseInt(form.amount) });
      onClose();
      onSuccess();
    } catch (e) {
      seterrors(parseErrors(e) || ["terjadi kesalahan"]);
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
            method="POST"
            class="flex flex-col gap-6"
            onSubmit={handleSubmit}
          >
            <AlertError messages={errors}></AlertError>
            <div class="rounded-xl overflow-hidden">
              <select
                onChange={handleChange}
                value={form.currency_code}
                name="wallet_id"
                id="wallet_id"
                class="form-input"
              >
                <option value="" disabled>
                  Select Wallet
                </option>
                {wallets.map((wallet, index) => {
                  return (
                    <option key={index} value={wallet.id}>
                      {wallet.name}
                    </option>
                  );
                })}
              </select>
              <select
                onChange={handleChange}
                value={form.currency_code}
                name="category_id"
                id="category_id"
                class="form-input"
              >
                <option value="" disabled>
                  Select Category
                </option>
                <optgroup label="EXPENSE">
                  {categories.map((category, index) => {
                    if (category.type == "EXPENSE") {
                      return (
                        <option key={index} value={category.id}>
                          {category.name}
                        </option>
                      );
                    }
                  })}
                </optgroup>
                <optgroup label="INCOME">
                  {categories.map((category, index) => {
                    if (category.type == "INCOME") {
                      return (
                        <option key={index} value={category.id}>
                          {category.name}
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
                placeholder="Amount"
              />
              <input
                onChange={handleChange}
                value={form.date}
                type="date"
                id="date"
                name="date"
                class="form-input"
                placeholder="date"
              />
              <input
                onChange={handleChange}
                value={form.note}
                type="text"
                id="note"
                name="note"
                class="form-input"
                placeholder="note"
              />
            </div>

            <button type="submit" class="btn btn-lg w-full mt-4">
              {loading ? "saving" : "save"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
