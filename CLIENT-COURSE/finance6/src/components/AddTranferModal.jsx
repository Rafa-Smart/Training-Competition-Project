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
    form_wallet_id: "",
    form_category_id: "",
    form_note: "",
    to_wallet_id: "",
    to_category_id: "",
    to_note: "",
    amount: 0,
    date: "",
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    setForm({
      form_wallet_id: defaultWalletId || "",
      form_category_id: "",
      form_note: "",
      to_wallet_id: "",
      to_category_id: "",
      to_note: "",
      amount: 0,
      date: getToday(),
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
      if (form.to_wallet_id == form.from_wallet_id) {
        window.alert("a boleh sama nih waleltnya bro");
        return;
      }

      await transactionApi.transfer({ ...form, amount: parseInt(amount) });
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
          <h3 class="text-lg">Transfer Money</h3>
          <button class="modal-close" onClick={() => onClose()}>
            ×
          </button>
        </div>
        <div class="modal-body overflow-y-auto max-h-[calc(100vh_-_80px_-_77px)]">
          <form
            action=""
            onSubmit={handleSubmit}
            method="POST"
            class="flex flex-col gap-6"
          >
            <div>
              <h3 class="mb-2">FROM</h3>
              <div class="rounded-xl overflow-hidden">
                <input
                  onChange={handleChange}
                  value={form.amount}
                  type="number"
                  id="amount"
                  name="amount"
                  class="form-input form-input-xl"
                  placeholder="Enter amount"
                />
                <select
                  onChange={handleChange}
                  value={form.from_wallet_id}
                  name="from_wallet_id"
                  id="from_wallet_id"
                  class="form-input"
                >
                  <option value="" disabled hidden>
                    From Wallet
                  </option>
                  {wallets.map((wallet, index) => {
                    return (
                      <option key={index} value={wallet.id}>
                        {wallet.name} {wallet.currency_code}
                      </option>
                    );
                  })}
                </select>
                <select
                  name="from_category_id"
                  onChange={handleChange}
                  value={form.form_category_id}
                  id="from_category_id"
                  class="form-input form-input-lg"
                >
                  <option value="" disabled hidden>
                    Select Category
                  </option>
                  {categories.map((category, index) => {
                    if (category.type == "EXPENSE") {
                      return (
                        <option value={category.name} key={index}>
                          {category.icon} - {category.name}
                        </option>
                      );
                    }
                  })}
                </select>
                <textarea
                  onChange={handleChange}
                  value={form.from_note}
                  id="from_note"
                  rows="3"
                  name="from_note"
                  class="form-input"
                  placeholder="Enter note"
                ></textarea>
              </div>
            </div>

            <div>
              <h3 class="mb-2">TO</h3>
              <div class="rounded-xl overflow-hidden">
                <select
                  name="to_wallet_id"
                  id="to_wallet_id"
                  class="form-input"
                  onChange={handleChange}
                  value={form.to_wallet_id}
                >
                  <option value="" disabled hidden>
                    Destination Wallet
                  </option>
                  {wallets.map((wallet, index) => {
                    return (
                      <option key={index} value={wallet.id}>
                        {wallet.name} {wallet.currency_code}
                      </option>
                    );
                  })}
                </select>
                <select
                  name="to_category_id"
                  id="to_category_id"
                  onChange={handleChange}
                  value={form.to_category_id}
                  class="form-input form-input-lg"
                >
                  <option value="" disabled hidden>
                    Select Category
                  </option>
                  {categories.map((category, index) => {
                    if (category.type == "INCOME") {
                      return (
                        <option value={category.name} key={index}>
                          {category.icon} - {category.name}
                        </option>
                      );
                    }
                  })}
                </select>
                <textarea
                  onChange={handleChange}
                  value={form.to_note}
                  id="to_note"
                  rows="3"
                  name="to_note"
                  class="form-input"
                  placeholder="Enter note"
                ></textarea>
              </div>
            </div>

            <div>
              <h3 class="mb-2">DATE</h3>
              <div class="rounded-xl overflow-hidden">
                <input
                  onChange={handleChange}
                  value={form.date}
                  type="date"
                  id="date"
                  name="date"
                  class="form-input"
                  placeholder="Enter date"
                />
              </div>
            </div>

            <button type="submit" class="btn btn-lg mt-4">
              {loading ? "tranfering" : "tranfer"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
