import { useEffect, useState } from "react";
import { transactionApi } from "../api/transaction";
import { walletApi } from "../api/wallet";
import { categoryApi } from "../api/category";
import { getToday } from "../utils/format";

export default AddTransferModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultWalletId,
}) => {
  const [form, setForm] = useState({
    from_wallet_id: "",
    from_category_id: "",
    from_note: "",
    amount: 0,
    date: "",
    to_wallet_id: "",
    to_category_id: "",
    to_note: "",
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
      from_wallet_id: defaultWalletId,
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
          <h3 class="text-lg">Transfer Money</h3>
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
            <h2>From Data</h2>
            <div class="rounded-xl overflow-hidden">
              <select
                onChange={handleChange}
                value={form.currency_code}
                name="from_wallet_id"
                id="from_wallet_id"
                class="form-input"
              >
                <option value="" disabled>
                  Select Wallet from
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
                name="from_category_id"
                id="from_category_id"
                class="form-input"
              >
                <option value="" disabled>
                  Select Category From
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
              </select>
              <input
                onChange={handleChange}
                value={form.note}
                type="text"
                id="from_note"
                name="from_note"
                class="form-input"
                placeholder="note"
              />
            </div>
            <h2>To Data</h2>
            <div class="rounded-xl overflow-hidden">
              <select
                onChange={handleChange}
                value={form.currency_code}
                name="to_wallet_id"
                id="to_wallet_id"
                class="form-input"
              >
                <option value="" disabled>
                  Select Wallet from
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
                name="to_category_id"
                id="to_category_id"
                class="form-input"
              >
                <option value="" disabled>
                  Select Category To
                </option>
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
                value={form.note}
                type="text"
                id="to_note"
                name="to_note"
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
