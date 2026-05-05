import { useEffect, useState } from "react";
import { currencyApi } from "../api/currency";
import { walletApi } from "../api/wallet";
import { parseErrors } from "../utils/format";

export default AddWalletModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    currency_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  useEffect(async () => {
    const data = await currencyApi.index();
    setCurrencies(data.data.data.currencies);
  }, [isOpen]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      await walletApi.store(form);
      onClose();
      onSuccess();
    } catch (e) {
      setErrors(parseErrors(e) || ["terjaid kesalahn"]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div
        className="modal is-open"
        onClick={(e) => e.target == e.currentTarget && onClose()}
      >
        <div className="modal-header">
          <div />
          <h3 className="text-lg">Add Wallet</h3>
          <button className="modal-close" onClick={() => onClose()}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form
            action
            method="POST"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            <div className="rounded-xl overflow-hidden">
              <select
                name="currency_code"
                id="currency_code"
                className="form-input"
                onChange={handleChange}
                value={form.currency_code}
              >
                <option value disabled>
                  Select Currency
                </option>
                {currencies.map((currency) => {
                  return (
                    <option value={currency.id} key={currency.id}>
                      {currency.name}
                    </option>
                  );
                })}
              </select>
              <input
                onChange={handleChange}
                value={form.name}
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Wallet Name"
              />
            </div>
            <button type="submit" className="btn btn-lg w-full mt-4">
              {
                loading ? "saving..." :'save'
              }
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
