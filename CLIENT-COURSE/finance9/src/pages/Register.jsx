import { useState } from "react"
import { parseErrors } from "../utils/format";
import { authApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import AlertError from "../utils/Alert";

const Register = () => {
 const [form, setForm] = useState({
    full_name:'', email:'', password:''
 });
 const [errors, setErrors] = useState([]);
 const [loading, setLoading] = useState(false);
 const {user, loginUser} = useAuth()
 const navigate = useNavigate()
 const handleChange = (e) => setForm({...form, [e.target.name]:e.target.value})
 const handleSubmit = async(e) => {
    e.preventDefault()
    setErrors([])
    setLoading(true)
    try {
        const response = await authApi.register(form);
        // loginUser(response.data.data, response.data.data.token);
        // atau bisa juga kaya gini
        console.log(response.data.data)
        const {token, ...userData} = response.data.data;
        loginUser(userData, token);
        navigate('/')
    }catch(e){
        setErrors(parseErrors(e.response?.data?.errors) || ['terjadi kesalahan'])
    }finally{
        setLoading(false)
    }
 }
 return <>  
    <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <form    onSubmit={handleSubmit} method="POST" className="max-w-[500px] mx-auto w-full flex flex-col gap-5">
            <h2 className="text-2xl font-semibold text-center">Register</h2>
 {
                errors && <AlertError messages={errors}></AlertError>
            }
            <div className="rounded-xl overflow-hidden">
                <input value={form.full_name} onChange={(e) => handleChange(e)} id="name" type="text" placeholder="Name" className="form-input" name="full_name"/>
                <input value={form.email} onChange={(e) => handleChange(e)} id="email" type="email" placeholder="Email" className="form-input" name="email"/>
                <input value={form.password} onChange={(e) => handleChange(e)} id="password" type="password" placeholder="Password" className="form-input" name="password"/>
            </div>

            <div>
                <button type="submit" className="btn btn-lg w-full">
                    {
                        loading ? "Registering...":'Register'
                    }
                </button>
            </div>
        </form>

        <div className="text-center text-gray-300 mt-5">
            Already registered? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
        </div>
    </main></>
}

export default Register;