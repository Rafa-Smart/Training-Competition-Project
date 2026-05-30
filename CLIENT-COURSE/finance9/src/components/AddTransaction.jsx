import { useEffect, useState } from "react";
import { getToday, parseErrors } from "../utils/format";
import { walletApi } from "../api/wallet";
import { categoryApi } from "../api/category";

const AddTransaction = ({ isOpen, onClose, onSuccess, defaultId }) => {
  const [form, setForm] = useState({
    wallet_id: "",
    category_id: "",
    note:'',
    date:'',
    amount:''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState();
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([])

  useEffect(() => {
      setForm({
        ...form,
        wallet_id:defaultId,
        date:getToday(),
      });
      categoryApi.get().then(response => {
        setCategories(response.data.categories);
      });
      walletApi.get().then((response) => setWallets(response.data.wallets))
  }, [isOpen])

  const handleChage = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
 
    try {
      await walletApi.create({...form, amount:parseInt(form.amount)});
      onClose();
      onSuccess();
    } catch (e) {
      setErrors(
        parseErrors(e?.response?.data?.errors) || ["terjadi kesalahan"],
      );
    } finally {
      setSubmitting(false);
    }
  };
  if (!isOpen) return null;
  return (
    <>
      <div
        className="modal is-open"
        onClick={(e) => e.currentTarget == e.target && onClose()}
      >
        <div className="modal-header">
          <div></div>
          <h3 className="text-lg">Add Transaction</h3>
          <button className="modal-close" onClick={(e) => onClose()}>×</button>
        </div>
        <div className="modal-body overflow-y-auto max-h-[calc(100vh_-_80px_-_77px)]">
          <form action="" method="POST" className="flex flex-col gap-6">
            <div>
              <h3 className="mb-2">Data</h3>
              <div className="rounded-xl overflow-hidden">
                <input
                  type="number"
                  id="amount"
                  value={form.amount}
                  onChange={(e) => handleChange(e)}
                  name="amount"
                  className="form-input form-input-xl"
                  placeholder="Enter amount"
                />
                <select
                value={form.form_wallet_id}
                  onChange={(e) => handleChange(e)}
                  name="wallet_id"
                  id="wallet_id"
                  className="form-input"
                >
                  <option value="" disabled hidden>
                     Wallet
                  </option>
                  {
                    wallets.map((wallet, index) => { 
                        return <option value={wallet.id}>{wallet.name} {wallet.currency_code}</option>
                       
                    })
                  }
                </select>
                <select
                  name="category_id"
                  id="category_id"
                  className="form-input form-input-lg"
                  value={form.category_id}
                  onChange={(e) => handleChange(e)}
                >
                  <option value="" disabled hidden>
                    Select Category
                  </option>
                 
                 {
                    categories.map((category, index) => {
                        return <option value={category.id}>{category.icon} {category.name}</option>
                    })

                 }
                </select>
                <textarea
                value={form.note}
                  onChange={(e) => handleChange(e)}
                  id="note"
                  rows="3"
                  name="note"
                  className="form-input"
                  placeholder="Enter note"
                ></textarea>
              </div>
            </div>

         

            <div>
              <h3 className="mb-2">DATE</h3>
              <div className="rounded-xl overflow-hidden">
                <input
                  value={form.date}
                  onChange={(e) => handleChange(e)}
                  type="date"
                  id="date"
                  name="date"
                  className="form-input"
                  placeholder="Enter date"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-lg mt-4">
              {
                submitting ? 'submitting...':'submit'
              }
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddTransaction;
