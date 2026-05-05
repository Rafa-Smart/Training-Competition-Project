import { useEffect, useState } from "react";
import { formatCurrency, getToday, parseErrors } from "../utils/format";
import { transactionApi } from "../api/transaction";
import { walletApi } from "../api/wallet";
import { categoryApi } from "../api/category";
import AlertError from "../utils/AlertError";

export default TranferModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultWalletId,
}) => {
  const [form, setForm] = useState({
    from_wallet_id: "",
    to_wallet_id: "",
    from_category_id: "",
    to_category_id: "",
    from_note: "",
    to_note: "",
    amount: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);

  useEffect(async () => {
    const data1 = await walletApi.index();
    setWallets(data1.data.data.wallets);
    const data2 = await categoryApi.index();
    setCategories(data2.data.data.categories);
  }, [isOpen]);

  useEffect(() => {
    setForm({
      from_wallet_id: defaultWalletId || "",
      to_wallet_id: "",
      from_category_id: "",
      to_category_id: "",
      from_note_id: "",
      to_note_id: "",
      amount: "",
      date: getToday(),
    });
  }, [isOpen]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
        if(form.from_wallet_id == form.to_wallet_id) return;
      await transactionApi.tranfer({ ...form, amount: parseInt(form.amount) });
      onClose();
      onSuccess();
    } catch (e) {
      setErrors(parseErrors(e) || ["terjadi kesalahan"]);
    } finally {
      setLoading(false);
    }
  };

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

          <AlertError messages={errors}></AlertError>
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
                  name="from_wallet_id"
                  onChange={handleChange}
                  value={form.from_wallet_id}
                  id="from_wallet_id"
                  class="form-input"
                >
                  <option value="" disabled hidden>
                    From Wallet
                  </option>
                  {
                    wallets.map((wallet) => {
                        return <option value={wallet.id} key={wallet.id}>{wallet.name}</option>
                    })
                  }
                </select>
                <select
                onChange={handleChange}
                value={form.from_category_id}
                  name="from_category_id"
                  id="from_category_id"
                  class="form-input form-input-lg"
                >
                  <option value="" disabled hidden>
                    Select Expense Category
                  </option>
                  {
                    categories.map((category) => {
                        if(category.type == "EXPENSE"){
                            return <option value={category.id} key={category.id}>{category.name}</option>
                        }
                    })
                  }
                </select>
                <textarea
                  id="from_note"
                  onChange={handleChange}
                  value={form.from_note}
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
                onChange={handleChange}
                value={form.to_wallet_id}
                  name="to_wallet_id"
                  id="to_wallet_id"
                  class="form-input"
                >
                  <option value="" disabled hidden>
                    Destination Wallet
                  </option>
                  {
                    wallets.map((wallet) => {
                        return <option>{wallet.name} {wallet.currency_code}</option>
                    })
                  }
                </select>
                <select
                  onChange={handleChange}
                value={form.to_category_id}
                  name="to_category_id"
                  id="to_category_id"
                  class="form-input form-input-lg"
                >
                  <option value="" disabled hidden>
                    Select Income Category
                  </option>
                  {
                    categories.map((category) => {
                        if(category.type == "INCOME"){
                            return <option value={category.id} key={category.id}>{category.name}</option>
                        }
                    })
                  }
                </select>
                <textarea
                  id="to_note"
                  onChange={handleChange}
                  value={form.to_note}
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
              {loading ? 'transfering...' :' transfer'} 
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
