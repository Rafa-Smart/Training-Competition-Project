// ============================================================
// FILE: src/utils/Alert.jsx
// FUNGSI: Komponen untuk menampilkan pesan error validasi.
//
// KONSEP:
// Saat register atau login gagal, backend mengirim objek "errors" yang
// isinya array pesan error per field. Komponen ini menerima array pesan
// tersebut (prop "messages") dan menampilkannya dalam satu kotak merah.
// Ada tombol × untuk menyembunyikan alertnya.
//
// CARA PAKAI (contoh di Login.jsx):
//   const [errors, setErrors] = useState([]);
//   <Alert messages={errors} />
//
// Kalau errors kosong atau sudah ditutup, komponen ini tidak render apapun.
//
// DIPAKAI DI:
// - src/pages/Login.jsx
// - src/pages/Register.jsx
// - src/components/AddWalletModal.jsx
// - src/components/AddTransactionModal.jsx
// - src/components/TransferModal.jsx

import { useEffect, useState } from "react"

// ============================================================
export default Alert = ({messages}) => {
    const [visible, setVisible] = useState(false);
    // jadi kita aka cek jika ada errornya aka tampilkan alo egga maka jangan tampilkan
    useEffect(() => {
        if(messages && messages.length > 0){
            setVisible(true)
        }
    }, [messages])


    // nah disi kita cek visiblenya kalo false maka akan reutrn null

    if(!visible){
        return null
    }


    // nah disi kita akna tampilkan errornya dan tombol x yang ketika di klik mak akna ubah visiblenya ai alse dan a akan terlihat lagi

    return (
        // kita pake style manual ya solnya kita itu pake style yang dari index.css
        // ini penitng ya untuk posisi relative yang ada didiv pembungkusnya karenakita pake x pake absolute didalam si divnya ini untuk si x
        <div style={{backgroundColor:'red', color:"white", padding:'4px', borderRadius:'5px', position:"relative"}}>
            <button style={{position:"absolute", right:"3px", top:"2px", color:"white", fontWeight:"bold"}}>X</button>
            {/* nah dinsi kita loop errornya*/}
            {messages.map((error, index) => {
                return <div key={index}>error</div>
            })}
        </div>
    )
}