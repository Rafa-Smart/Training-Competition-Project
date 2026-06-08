import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";
import { getToday, parseErrors } from "../utils/format";
import { useNavigate } from "react-router-dom";
import AlertError from "../utils/Alert";
import { transactionApi } from "../api/transction";
import { categoryApi } from "../api/category";
import { walletApi } from "../api/wallet";
import { currencyApi } from "../api/currency";

const AddWallet = ({ isOpen, onClose, onSuccess }) => {
  const { user, loginUser } = useAuth();
  const [currencies, setCurrencies] = useState([]);
  const [form, setForm] = useState({
    name: "",
    currency_code: "",
  });
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        currency_code: "",
      });
    }

    currencyApi.index().then((response) => {
      setCurrencies(response.data.data.currencies || [])
    }).catch((e) =>
        console.log("gagal ambil currencies di add wallet"),
      );;
  }, [isOpen]);
  const [loading, setLoading] = useState();
  const [errors, setErrors] = useState();
  const navigate = useNavigate();
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([])
    setLoading(true);
    try {
      await walletApi.create( form );
      navigate("/");
    } catch (e) {
      setErrors(parseErrors(e.response?.data?.errors) || ["terjadi kesalahan"]);
    } finally {
      setLoading(false);
      onClose();
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
        <h3 className="text-lg">Add Wallet</h3>
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
      
    
              <div className="rounded-xl overflow-hidden">
                <select
                  name="currency_code"
                  id="currency_code"
                  className="form-input"
                    value={form.currency_code}
                    onChange={handleChange}
                >
                  <option 
                    disabled
                  >
                    Select Currency
                  </option>
                  {currencies.map((currency, index) => {
                    return (
                      <option value={currency.code}>{currency.code}</option>
                    );
                  })}
                </select>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="Wallet Name"
                />
              </div>

              <button type="submit" className="btn btn-lg w-full mt-4">
                {
                    loading ? "saving...":"save"
                }
              </button>
            </form>
        
      </div>
    </div>
  );
};

export default AddWallet;
