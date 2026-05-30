import { useEffect, useState } from "react";
import { parseErrors } from "../utils/format";
import { walletApi } from "../api/wallet";
import AlertError from "../utils/Alert";
import { currencyApi } from "../api/currency";

const AddWallet = ({isOpen, onClose, onSuccess}) => {
    const [form, setForm] = useState({
        name:'',
        currency_code:''
    });
    const [currencies, setCurrencies] = useState([])
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState();
    useEffect(() => {
        currencyApi.get().then(response => setCurrencies(response.data.currencies));
    }, [isOpen])
    const handleChage = (e) => setForm({...form, [e.target.name]:e.target.value});
    const handleSubmit = async(e) => {
        e.preventDefault();
        setSubmitting(true)
        try {
            await walletApi.create(form);
            onClose();
            onSuccess();
        }catch(e){
            setErrors(parseErrors(e?.response?.data?.errors) || ['terjadi kesalahan'])
        }finally{
            setSubmitting(false)
        }
    }
    if(!isOpen)return null

    return <><div className="modal is-open" onClick={(e) => e.currentTarget == e.target && onCLose()}>
    <div className="modal-header">
        <div></div>
        <h3 className="text-lg">Add Wallet</h3>
        <button className="modal-close" onClick={() => onClose()}>×</button>
    </div>
    <div className="modal-body">
        <form onSubmit={handleSubmit} method="POST" className="flex flex-col gap-6">

            <AlertError messages={errors}></AlertError>
            <div className="rounded-xl overflow-hidden">
                <select onChange={() => handleChange(e)} 
                value={form.currency_code} name="currency_code" id="currency_code" className="form-input">
                    <option value="" disabled>Select Currency</option>
                    {
                        currencies.map((currency, index) => {
                            return <option value={currency.code}>{currency.code} {currency.name}</option>
                        } )
                    }
                </select>
                <input type="text"  onChange={() => handleChange(e)} 
                value={form.name} id="name" name="name" className="form-input" placeholder="Wallet Name"/>
            </div>

            <button type="submit" className="btn btn-lg w-full mt-4">
                {submitting ? 'saving...':'save'}
            </button>
        </form>
    </div>
</div></>
}   

export default AddWallet