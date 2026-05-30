import { useEffect, useState } from "react";
import { getToday, parseErrors } from "../utils/format";
import { walletApi } from "../api/wallet";
import { categoryApi } from "../api/category";

const Transfer = ({ isOpen, onClose, onSuccess, defaultId }) => {
  const [form, setForm] = useState({
    from_wallet_id: "",
    from_category_id: "",
    from_note:'',
    to_wallet_id:'',
    to_category_id:'',
    to_note:'',
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
        from_wallet_id:defaultId,
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
          <h3 className="text-lg">Transfer Money</h3>
          <button className="modal-close" onClick={(e) => onClose()}>×</button>
        </div>
        <div className="modal-body overflow-y-auto max-h-[calc(100vh_-_80px_-_77px)]">
          <form action="" method="POST" className="flex flex-col gap-6">
            <div>
              <h3 className="mb-2">FROM</h3>
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
                  name="from_wallet_id"
                  id="from_wallet_id"
                  className="form-input"
                >
                  <option value="" disabled hidden>
                    From Wallet
                  </option>
                  {
                    categories.map((category, index) => {
                      if(category.type != "EXPENSE"){
                        return <option value={category.id}>{category.icon} {category.name}</option>
                      }
                    })
                  }
                </select>
                <select
                  name="from_category_id"
                  id="from_category_id"
                  className="form-input form-input-lg"
                  value={form.from_category_id}
                  onChange={(e) => handleChange(e)}
                >
                  <option value="" disabled hidden>
                    Select Category
                  </option>
                 
                 {
                    categories.map((category, index) => {
                      if(category.type != "EXPENSE"){
                        return <option value={category.id}>{category.icon} {category.name}</option>
                      }
                    })

                 }
                </select>
                <textarea
                value={form.from_note}
                  onChange={(e) => handleChange(e)}
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
                  name="to_wallet_id"
                  id="to_wallet_id"
                  className="form-input"
                >
                  <option value="" disabled hidden>
                    Destination Wallet
                  </option>
                  <option>Wallet Name 3 (IDR)</option>
                  <option>Wallet Name 4 (USD)</option>
                </select>
                <select
                  name="to_category_id"
                  id="to_category_id"
                  className="form-input form-input-lg"
                >
                  <option value="" disabled hidden>
                    Select Category
                  </option>
                  <option value="">Icon - Category Name</option>
                </select>
                <textarea
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
    </>
  );
};

export default AddTransaction;
