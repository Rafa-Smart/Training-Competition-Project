import { useEffect, useState } from "react";
import { walletApi } from "../api/wallet";
import { currencyApi } from "../api/currency";
import AlertError from "../utils/AlertError";

export default AddWalletModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState();
  const [currencies, setCurrencies] = useState([]);
  const [form, setForm] = useState({
    name: "",
    currency_code: "",
  });
  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
      await walletApi.store(form);
      onSuccess();
      onclose();
    } catch (e) {
      setErrors(
        parseErrors(e?.response?.data?.errors) || ["terjadi kesalahan"],
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(async () => {
    const currencies = await currencyApi.index();
    setCurrencies(currencies);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setForm({ currency_code: "", name: "" });
      setErrors([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          <form action method="POST" className="flex flex-col gap-6">
            <AlertError messages={errors}></AlertError>
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
              {loading ? "saving..." : "save"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
