import { useEffect, useState } from "react";
import { walletApi } from "../api/wallet";
import { currencyApi } from "../api/currency";

export default AddWalletModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    currency_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, seterrors] = useState([]);
  const navigate = useNavigate();
  const [currencies, setCurrencies] = useState();

  useEffect(() => {
    currencyApi
      .index()
      .then((res) => setCurrencies(res.data.data.currencies))
      .catch((e) => alert("err"));
    
  }, [isOpen]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    try {
      await walletApi.store(form);
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
          <h3 class="text-lg">Add Wallet</h3>
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
          
            <div class="rounded-xl overflow-hidden">
              <select
                onChange={handleChange}
                value={form.currency_code}
                name="currency_code"
                id="currency_code"
                class="form-input"
              >
                <option value="" disabled>
                  Select Currency
                </option>

                {currencies.map((currency, index) => (
                  <option value={currency.code} key={index}>
                    {currency.code} {currency.name}
                  </option>
                ))}
              </select>
              <input
                onChange={handleChange}
                value={form.name}
                type="text"
                id="name"
                name="name"
                class="form-input"
                placeholder="Wallet Name"
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
