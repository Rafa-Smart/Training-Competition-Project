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
    setErrors([])
  }, [isOpen, defaultWalletId]);

  const handleChange = (e) => {
    setForm({...prevFrom, [e.target.name]:e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);
    setErrors([]);
    try {
        await transactionApi.transferMoney(form);
        onClose();
        onSuccess()
    }catch(e){
        setErrors(parseErrors(e.response?.data?.errors)||['gagal transfer'])
    }finally{
        setLoading(false)
    }
  }
};
