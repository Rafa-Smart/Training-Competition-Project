import { useEffect, useState } from "react";
import { walletApi } from "../api/wallet";
import { categoryApi } from "../api/category";
import { transactionApi } from "../api/transaction";

export default AddTransferModal = ({
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
    from_note_id: "",
    to_note_id: "",
    amount: "",
    date: "",
  });

  const [errors, setErrors] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false)
  const [expanseCategories, setExpanseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  useEffect(async () => {
    const data1 = walletApi.index();
    setWallets(data1.data.wallets);
    const data2 = categoryApi.index();
    setExpanseCategories(
      data2.data.categories.map((category) => category.type == "EXPENSE"),
    );
    setIncomeCategories(
      data2.data.categories.map((category) => category.type == "INCOME"),
    );
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
  }, [isOpen, defaultWalletId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async(e) => {
    setLoading(true);
    e.preventDefault();
    setErrors([])
    try{

            if (form.from_wallet_id === form.to_wallet_id) {
      setErrors(["Wallet asal dan tujuan tidak boleh sama"]);
      setSubmitting(false);
      return;
    }

        await transactionApi.transfer({...form,amount:parseInt(form.amount)});
        onClose();
        onSuccess()
    }catch(e){
    setErrors(parseErrors(e.response?.data?.errors) || ['terjadi kesalahan'])
    }finally{
        setLoading(false)
    }
  };

  if(!isOpen)return null;



  return (<><div className="modal is-open" onClick={(e) => e.target == e.currentTarget && onClose()}>
  <div className="modal-header">
    <div />
    <h3 className="text-lg">Transfer Money</h3>
    <button className="modal-close" onClick={() => onclose()}>×</button>
  </div>
  <div className="modal-body overflow-y-auto max-h-[calc(100vh_-_80px_-_77px)]">
    <form action method="POST" className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2">FROM</h3>
        <div className="rounded-xl overflow-hidden">
          <input type="number" id="amount" name="amount" className="form-input form-input-xl" placeholder="Enter amount" />
          <select name="from_wallet_id" id="from_wallet_id" className="form-input" onChange={handleChange}>
            <option value disabled hidden>From Wallet</option>
            {
                wallets.map((wallet) => {
                    return <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                })
            }
          </select>
          <select name="from_category_id" onChange={handleChange} id="from_category_id" className="form-input form-input-lg">
            <option value disabled hidden>Select Category</option>
            {
                expanseCategories.map((category) => {
                    return <option key={category.id} value={category.id}>{category.icon} - {category.name}</option>
                })
            }
          </select>
          <textarea id="from_note" rows={3} name="from_note" onChange={handleChange} className="form-input" placeholder="Enter note" defaultValue={""} />
        </div>
      </div>
      <div>
        <h3 className="mb-2">TO</h3>
        <div className="rounded-xl overflow-hidden">
          <select name="to_wallet_id" id="to_wallet_id" onChange={handleChange} className="form-input">
            <option value disabled hidden>Destination Wallet</option>
            {
                wallets.map((wallet) => {
                    return <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                })
            }
          </select>
          <select name="to_category_id" id="to_category_id" onChange={handleChange} className="form-input form-input-lg">
            <option value disabled hidden>Select Category</option>
            {
                incomeCategories.map((category) => {
                    return <option key={category.id} value={category.id}>{category.icon} - {category.name}</option>
                })
            }
          </select>
          <textarea id="to_note" rows={3} name="to_note" onChange={handleChange} className="form-input" placeholder="Enter note" defaultValue={""} />
        </div>
      </div>
      <div>
        <h3 className="mb-2">DATE</h3>
        <div className="rounded-xl overflow-hidden">
          <input type="date" id="date" name="date" onChange={handleChange} className="form-input" placeholder="Enter date" />
        </div>
      </div>
      <button type="submit" className="btn btn-lg mt-4">{loading ?'transfering...':'tranfer'}</button>
    </form>
  </div>
</div>
</>)
};
