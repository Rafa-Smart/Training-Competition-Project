import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";
import { getToday, parseErrors } from "../utils/format";
import { useNavigate } from "react-router-dom";
import AlertError from "../utils/Alert";
import { transactionApi } from "../api/transction";
import { categoryApi } from "../api/category";
import { walletApi } from "../api/wallet";

const AddTransaction = ({ isOpen, onClose, onSuccess, defaultId }) => {
  const { user, loginUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [form, setForm] = useState({
    wallet_id: "",
    category_id: "",
    note: "",
    amount: "",
    date: "",
  });
  useEffect(() => {
    if (isOpen) {
      setForm({
        wallet_id: defaultId || "",
        category_id: "",
        note: "",
        amount: "",
        date: getToday(),
      });
    }

    categoryApi.index().then((response) => {
      setCategories(response.data.data.categories || [])
    }).catch((e) =>
        console.log("gagal ambil catgory"),
      );;

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
      await transactionApi.create({ ...form, amount: Number(form.amount) });
      navigate("/");
    } catch (e) {
      setErrors(parseErrors(e.response?.data?.errors) || ["terjadi kesalahan"]);
    } finally {
      setLoading(false);onClose();
      onSuccess()
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
        <h3 className="text-lg">Add Transaction</h3>
        <button className="modal-close" onClick={() => onClose()}>
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
            <div className="rounded-xl overflow-hidden">
              <h3 className="mb-2">Add Transaction</h3>
              <input
                onChange={handleChange}
                value={form.amount}
                type="number"
                id="amount"
                name="amount"
                className="form-input form-input-xl"
                placeholder="Enter amount"
              />
              <select
                onChange={handleChange}
                value={form.wallet_id}
                name="wallet_id"
                id="wallet_id"
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
                value={form.category_id}
                name="category_id"
                id="category_id"
                className="form-input form-input-lg"
              >
                <option value="" disabled hidden>
                  Select Category
                </option>
                {categories.map((category, index) => {
                  return (
                    <option value={category.id} key={index}>
                      {category.icon} - {category.name}
                    </option>
                  );
                })}
              </select>
              <textarea
                onChange={handleChange}
                value={form.note}
                id="note"
                rows="3"
                name="note"
                className="form-input"
                placeholder="Enter note"
              ></textarea>
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
          </div>

          <button type="submit" className="btn btn-lg mt-4">
            {
              loading? "Add Transaction...":"Add Transaction"
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
