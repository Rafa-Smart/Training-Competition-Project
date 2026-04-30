import { useEffect, useState } from "react";
import { currencyApi } from "../api/category";
import { walletApi } from "../api/wallet";
import { parseErrors } from "../utils/format";
import Alert from "../utils/Alert";

export default AddWalletModal = ({ isOpen, onClose, onSuccess }) => {
  // jaid kita akna ambil seluruh currencies untuk pilihan currecynya ya
  // dan jgan upakita akn handle si erronya utuk inputannya ni

  const [formData, setFormData] = useState({
    name: "name",
    currency_code: "currency_code",
  });

  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  //   ah jadi tiap kali si modal ini di buka maka akan fetch ulang ya
  // si currenciesya
  useEffect(async () => {
    if (isOpen) {
      const data = await currencyApi.index();
      setCurrencies(data.data.data.currencies); // ini dari si laravelnya ya
    }
  }, [isOpen]);

  //   /nah sekalian kit areset si formnya dan erronaya ketika si modalnya ii di buka lagi

  useEffect(() => {
    if (isOpen) {
      setErrors([]);
      setFormData({ currency_code: "", name: "" });
    }
  }, [isOpen]);

  //   kita buatkan hanleonchange

  const handleChange = (e) => {
    setFormData({ ...prevData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    try {
      await walletApi.store(formData);
      onSuccess();
      onclose();
    } catch (e) {
      // nah disni si errornya kit isi dnegnaerrro yang udah di aprse ya
      // jai isinya akn menjadi array
      setErrors(parseErrors(e.response?.data?.errors) || ["terjadi kesalahan"]);
    } finally {
      setIsLoading(false);
    }
  };


// NAH JADI KOMPOENN INI AKAN SELALU DI PANGIL YA JADI DIA ITU HARCODED
// NAH MAKNYA DISNI KITA PAKE IS OPENNYA ITU KALO FALSE (ARTINYA EGGA DI BUKA, MAKA)
// KOMPONEN INI AKA RETURN NULL

if(!isOpen)return null;

{/* jadi nantinya komponent ini itu akan tergantung dnegan si isOpen nya ya apakah dia ke buka apa engga
    jadi nanti di overview itu akan ada state utnuk open apa engga jadi pas open itu pas ketiak dia klik button add nah nanti kana slalu ada komponen si addmodal walet ini negna isopenya itu isinya adalah state tadi */}
  return (
    <>
      <div className="modal is-open" onClick={e.target == e.currentTarget && onClose()}>
      {/* Tutup modal HANYA kalau klik di background, bukan di dalam modal
      jad currentTarget itu isinya adalah si modal is-open ini
      yaitu yang punya event handler nh kalo misalnya sama artinya kan dia angi klik selain dari si formnya ya atua algi klik si overlaynya maka akna close si modal ini
      
      soalnya kalo kita ga pake pengengecekan maka tiap kali kita klik inputan, select apa pokoknya yang ad adidalam modal maka aakan langsung ke close ya
      
      maknya disni dia hanya bsia close kalo dia kli si modalnya aja / backgroundnya aja*/}

      {/* INGAT YA INI TUH DI DIV ALING LUAR JADI ENGGA AKNA BUBBLE JDAI EMANG KALO KTITA KLIK OVERLAYNYA MAKA AKAN CLOSE SI MODALNYA INI */}

        <div className="modal-header">
          <div />
          <h3 className="text-lg">Add Wallet</h3>
          <button className="modal-close" onClick={() => onclose()}>X</button>
        </div>
        <div className="modal-body">
          <form action method="POST" onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Alert messages={errors}></Alert>


            <div className="rounded-xl overflow-hidden">
              <select
                name="currency_code"
                id="currency_code"
                className="form-input"
                onChange={(e) =>handleChange(e)}
                on
              >
                <option value={form.currency_code} disabled>
                  Select Currency
                </option>
               {currencies.map((currency) => {
                return <option value={currency.code}>{currency.code} - {currency.name}</option> 
               })}
              </select>
              <input
              onChange={(e) =>handleChange(e)}
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Wallet Name"
              />
            </div>
            <button type="submit" className="btn btn-lg w-full mt-4">
              {isLoading ? "submiting":"submit"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
