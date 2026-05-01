import { useEffect, useState } from "react";
import { categoryApi } from "../api/category";
import { walletApi } from "../api/wallet";
import { parseErrors } from "../utils/format";
import { transactionApi } from "../api/transaction";

export default TransferModal = ({
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
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(async () => {
    const data = await categoryApi.index();
    setCategories(data.data.data?.categories);
    const data2 = await walletApi.index();
    setWallets(data1.data?.data?.wallets);
  }, [isOpen]);

  useEffect(() => {
    setForm({
      amount: "",
      from_wallet_id: defaultWalletId || "", // Auto-select jika dari WalletDetail
      from_category_id: "",
      from_note: "",
      to_wallet_id: "",
      to_category_id: "",
      to_note: "",
      date: getTodayDate(), // nah disni kita langusng ambil time hari ini ya
    });
    setErrors([]);
  }, [isOpen, defaultWalletId]);

  const handleChange = (e) => {
    setForm({ ...prevFrom, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
      await transactionApi.transferMoney({
        ...formData,
        amount: parseInt(amount),
      });
      onClose();
      onSuccess();
    } catch (e) {
      setErrors(parseErrors(e.response?.data?.errors) || ["gagal transfer"]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return;
  return (
    <>
      <div
        className="modal is-open"
        onClick={e.target == e.currentTarget && onclose()}
      >
        <div className="modal-header">
          <div />
          <h3 className="text-lg">Tranfer Money</h3>
          <button className="modal-close" onClick={() => onclose()}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form
            action
            method="POST"
            className="flex flex-col gap-6"
            onSubmit={handleSubmit}
          >
            <div className="mt-5">
              <h3>FROM:</h3>
              <Alert messages={errors}></Alert>
              <div className="rounded-xl overflow-hidden">
                <select
                  name="from_wallet_id"
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value={form.from_wallet_id} disabled></option>
                  {wallets.map((wallet) => {
                    return (
                      <option value={wallet.id} key={wallet.id}>
                        {wallet.currency_code} {wallet.name}
                      </option>
                    );
                  })}
                </select>

                <select
                  name="from_category_id"
                  value={form.from_category_id}
                  onChange={handleChange}
                  id="from_category_id"
                  className="form-input"
                >
                  <option value={""} disabled>
                    Select Expense category
                  </option>

                  {/* nah ini dia yang kerenya */}
                  {/* kita bis pake kaya sub gitu */}
                  <optgroup label="EXPENSE">
                    {categories.map((category) => {
                      if (category.type == "EXPENSE") {
                        return (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        );
                      }
                    })}
                  </optgroup>
                </select>
                <input
                  onChange={handleChange}
                  type="number"
                  id="name"
                  value={form.amount}
                  name="amount"
                  className="form-input"
                  placeholder="amount"
                />
                <input
                  value={form.date}
                  type="date"
                  onChange={handleChange}
                  id="name"
                  name="date"
                  className="form-input"
                />
                <textarea
                  onChange={handleChange}
                  name="note"
                  value={form.note}
                  rows={3}
                  className="form-input"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-lg w-full mt-4">
                {loading ? "submiting" : "submit"}
              </button>
            </div>
            <div className="mt-5">
              <h3>To:</h3>

              <Alert messages={errors}></Alert>
              <div className="rounded-xl overflow-hidden">
                <select
                  name="wallet_id"
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value={wallet.id}>{wallet.id}</option>
                  {wallets.map((wallet) => {
                    return (
                      <option value={wallet.id} key={wallet.id}>
                        {wallet.currency_code} {wallet.name}
                      </option>
                    );
                  })}
                </select>

                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  id="category_id"
                  className="form-input"
                >
                  <option value={""} disabled>
                    Select categories
                  </option>

                  {/* nah ini dia yang kerenya */}
                  {/* kita bis pake kaya sub gitu */}
                  <optgroup label="EXPENSE">
                    {categories.map((category) => {
                      if (category.type == "EXPENSE") {
                        return (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        );
                      }
                    })}
                  </optgroup>
                  <optgroup label="INCOME">
                    {categories.map((category) => {
                      if (category.type == "INCOME") {
                        return (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        );
                      }
                    })}
                  </optgroup>
                </select>
                <input
                  onChange={handleChange}
                  type="number"
                  id="name"
                  value={form.amount}
                  name="amount"
                  className="form-input"
                  placeholder="amount"
                />
                <input
                  value={form.date}
                  type="date"
                  onChange={handleChange}
                  id="name"
                  name="date"
                  className="form-input"
                />
                <textarea
                  onChange={handleChange}
                  name="note"
                  value={form.note}
                  rows={3}
                  className="form-input"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-lg w-full mt-4">
                {loading ? "submiting" : "submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
