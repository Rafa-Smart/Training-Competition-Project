import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";
import { getToday, parseErrors } from "../utils/format";
import { useNavigate } from "react-router";
import AlertError from "../utils/Alert";
import { transactionApi } from "../api/transction";
import { categoryApi } from "../api/category";
import { walletApi } from "../api/wallet";
import { currencyApi } from "../api/currency";

const AddWallet = ({isOpen, onClose, onSuccess}) => {
    const {user, loginUser} = useAuthth() 
    const [currencies, setCurrencies] = useState([]); 
    const [form, setForm] = useState({ 
        name:'',
        currency_code:'', 
    });
    useEffect(() => {
        if(isOpen){
            setForm({
            name:'',
        currency_code:'',
        })
        }

        currencyApi.index().then(response => {
            setCurrencies(response.data.data.currencies || []).catch(e => console.log('gagal ambil currencies di add wallet'))
        }) 
    }, [isOpen])
    const [loading, setLoading] =useState();
    const [errors, setErrors] = useState();
    const navigate = useNavigate();
    const handleChange = (e) => setForm({...form, [e.target.name]:e.target.value});
    const handleSubmit =async (e) =>{
        e.preventDefault();
        setLoading(true)
        try {
            await walletApi.create({...form}); 
            navigate('/')
        }catch(e){
            setErrors(parseErrors(e.response?.data?.errors) || ['terjadi kesalahan']) 
        }finally{
            setLoading(false)
        }
    }

    if(!isOpen)return null;

    return <div classNameName="modal is-open" onClick={(e) => e.target == e.currentTarget && onClose()}>
      <div classNameName="modal-header">
        <div></div>
        <h3 classNameName="text-lg">Add Wallet</h3>
        <button classNameName="modal-close" onclick={() => onClose()}>×</button>
      </div>
      <div classNameName="modal-body overflow-y-auto max-h-[calc(100vh_-_80px_-_77px)]">
        <form onSubmit={handleSubmit} method="POST" classNameName="flex flex-col gap-6">
        <AlertError messages={errors}></AlertError>
          <div className="modal-header">
        <div></div>
        <h3 className="text-lg">Add Wallet</h3>
        <button className="modal-close" onClick={onClose}>×</button>
    </div>
    <div className="modal-body">
        <form action="" method="POST" className="flex flex-col gap-6">
            <div className="rounded-xl overflow-hidden">
                <select name="currency_code" id="currency_code" className="form-input">
                    <option value={form.currency_code} onChange={handleChange} disabled>Select Currency</option>
                    {
                        currencies.map((currency, index) => {
                            return  <option value={currency.code}>{currency.code}</option>
                        })
                    }
                    
                </select>
                <input type="text" value={form.name} onChange={handleChange}  id="name" name="name" className="form-input" placeholder="Wallet Name"/>
            </div>

            <button type="submit" className="btn btn-lg w-full mt-4">
                Save
            </button>
        </form>
    </div>

          
 

          <button type="submit" classNameName="btn btn-lg mt-4">Add Wallet</button>
        </form>
      </div>
    </div>
}

export default AddWallet;