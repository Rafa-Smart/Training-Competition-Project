import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"
import { useState } from "react";
import Alert from "../utils/Alert";
import { authApi } from "../api/auth";
import { parseErrors } from "../utils/format";

export default Login = () => {
    const [loginUser] = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({email:'',password:''});
    const [errors, setErrors] = useState([]);

    const handleChange = (e) => {
        setForm({...form, [e.target.name]:e.target.value});
        setErrors([]);
    }


    const handleSubmit =async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors([])
        try {
            const {token,...user} = authApi.login(form);
            loginUser(token, user);
            navigate('/')
        }catch(e){
            setErrors(parseErrors(e.data?.response?.errors) || ['terjadi kesalaahan'])
        }finally{
            setLoading(false)
        }
    } 




    return <>
        <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <form action method="POST" className="max-w-[500px] mx-auto w-full flex flex-col gap-5">
        <Alert messages={errors}></Alert>
            <h2 className="text-2xl font-semibold text-center">Login</h2>
            <div className="rounded-xl overflow-hidden">
            <input id="email" onChange={handleChange} type="email" placeholder="Email" className="form-input" name="email" />
            <input id="password" onChange={handleChange} type="password" placeholder="Password" className="form-input" name="password" />
            </div>
            <div>
            <button type="submit" className="btn btn-lg w-full">
                Login
            </button>
            </div>
        </form>
        <div className="text-center text-gray-300 mt-5">
            Don't have an account? <a href="register.html" className="text-blue-400 hover:underline">Register</a>
        </div>
        </main>
    </>
}