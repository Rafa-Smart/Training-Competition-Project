import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";
import { getToday, parseErrors } from "../utils/format";
import { useNavigate } from "react-router";
import AlertError from "../utils/Alert";
import { transactionApi } from "../api/transction";
import { categoryApi } from "../api/category";
import { walletApi } from "../api/wallet";

const Transfer = ({ isOpen, onClose, onSuccess, defaultId }) => {
  const { user, loginUser } = useAuthth();
  const [exponseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, seIncomeCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [form, setForm] = useState({
    from_wallet_id: "",
    from_category_id: "",
    from_note_id: "",
    to_wallet_id: "",
    to_category_id: "",
    to_note_id: "",
    amount: "",
    date: "",
  });
  useEffect(() => {
    if (isOpen) {
      setForm({
        from_wallet_id: defaultId || '',
        from_category_id: "",
        from_note_id: "",
        to_wallet_id: "",
        to_category_id: "",
        to_note_id: "",
        amount: "",
        date: getToday(),
      });
    }

    categoryApi.index().then((response) => {
      setExpenseCategories(
        response.data.data.categories.filter((c) => c.type == "EXPENSE") || [],
      ).catch((e) => console.log("gagal ambil catgory expense"));
      setExpenseCategories(
        response.data.data.categories.filter((c) => c.type == "INCOME") || [],
      ).catch((e) => console.log("gagal ambil category income"));
    });

    walletApi
      .index()
      .then((response) => {
        setWallets(response.data.data.wallets || []);
      })
      .catch((e) => console.log("gagal ambil data walet dari trnasfer"));
  }, [isOpen]);
  const [loading, setLoading] = useState();
  const [errors, setErrors] = useState();
  const navigate = useNavigate();
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionApi.transfer({ ...form, amount: Number(form.amount) });
      navigate("/");
    } catch (e) {
      setErrors(parseErrors(e.response?.data?.errors) || ["terjadi kesalahan"]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal is-open"
      onClick={(e) => e.target == e.currentTarget && onClose()}
    >
      <div className="modal-header">
        <div></div>
        <h3 className="text-lg">Transfer Money</h3>
        <button className="modal-close" onclick={() => onClose()}>
          ×
        </button>
      </div>
      <div className="modal-body overflow-y-auto max-h-[calc(100vh_-_80px_-_77px)]">
        <form
          onSubmit={handleSubmit}
          method="POST"
          className="flex flex-col gap-6"
        >
          <AlertError messages={errors}></AlertError>
          <div>
            <h3 className="mb-2">FROM</h3>
            <div className="rounded-xl overflow-hidden">
              <input
                onChange={handleChange}
                value={form.from_amount}
                type="number"
                id="amount"
                name="amount"
                className="form-input form-input-xl"
                placeholder="Enter amount"
              />
              <select
                onChange={handleChange}
                value={form.from_wallet_id}
                name="from_wallet_id"
                id="from_wallet_id"
                className="form-input"
              >
                <option value="" disabled hidden>
                  From Wallet
                </option>
                {wallets.map((wallet, index) => {
                  return (
                    <option value={wallet.id} key={index}>
                      {wallet.currency_code} {wallet.name}
                    </option>
                  );
                })}
              </select>
              <select
                onChange={handleChange}
                value={form.from_category_id}
                name="from_category_id"
                id="from_category_id"
                className="form-input form-input-lg"
              >
                <option value="" disabled hidden>
                  Select Category
                </option>
                {exponseCategories.map((category, index) => {
                  return (
                    <option value={category.id}>
                      {category.icon} - {category.name}
                    </option>
                  );
                })}
              </select>
              <textarea
                onChange={handleChange}
                value={form.from_note}
                id="from_note"
                rows="3"
                name="from_note"
                className="form-input"
                placeholder="Enter note"
              ></textarea>
            </div>
          </div>

          <div>
            <h3 className="mb-2">TO</h3>
            <div className="rounded-xl overflow-hidden">
              <select
                onChange={handleChange}
                value={form.to_wallet_id}
                name="to_wallet_id"
                id="to_wallet_id"
                className="form-input"
              >
                <option value="" disabled hidden>
                  Destination Wallet
                </option>
                {wallets.map((wallet, index) => {
                  return (
                    <option value={wallet.id} key={index}>
                      {wallet.currency_code} {wallet.name}
                    </option>
                  );
                })}
              </select>
              <select
                onChange={handleChange}
                value={form.to_category_id}
                name="to_category_id"
                id="to_category_id"
                className="form-input form-input-lg"
              >
                <option value="" disabled hidden>
                  Select Category
                </option>
                {incomeCategories.map((category, index) => {
                  return (
                    <option value={category.id}>
                      {category.icon} - {category.name}
                    </option>
                  );
                })}
              </select>
              <textarea
                onChange={handleChange}
                value={form.to_note}
                id="to_note"
                rows="3"
                name="to_note"
                className="form-input"
                placeholder="Enter note"
              ></textarea>
            </div>
          </div>

          <div>
            <h3 className="mb-2">DATE</h3>
            <div className="rounded-xl overflow-hidden">
              <input
                onChange={handleChange}
                value={form.date}
                type="date"
                id="date"
                name="date"
                className="form-input"
                placeholder="Enter date"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-lg mt-4">
            Transfer
          </button>
        </form>
      </div>
    </div>
  );
};

export default Transfer;
