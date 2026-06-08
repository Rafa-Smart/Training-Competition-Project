import { useState } from "react";
import { parseErrors } from "../utils/format";
import { authApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router";
import AlertError from "../utils/Alert";

const Login = () => {
    const {user, loginUser} = useAuth()
    const [form, setForm] = useState({ 
        email:'',
        password:''
    });
    const [loading, setLoading] =useState();
    const [errors, setErrors] = useState();
    const navigate = useNavigate();
    const handleChange = (e) => setForm({...form, [e.target.name]:e.target.value});
    const handleSubmit =async (e) =>{
        e.preventDefault();
        setLoading(true)
        try {
            const { token,...userData} = await authApi.login(form);
            loginUser(userData, token);
            navigate('/')
        }catch(e){
            setErrors(parseErrors(e.response?.data?.errors) || ['terjadi kesalahan']) 
        }finally{
            setLoading(false)
        }
    }

    return <>    <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <form onSubmit={handleSubmit} method="POST" className="max-w-[500px] mx-auto w-full flex flex-col gap-5">
            <h2 className="text-2xl font-semibold text-center">Login</h2>
            <AlertError messages={errors}></AlertError>
            <div className="rounded-xl overflow-hidden">
                
                <input id="email"  onChange={handleChange} value={form.email}  type="email" placeholder="Email" className="form-input" name="email"/>
                <input id="password"  onChange={handleChange} value={form.password}  type="password" placeholder="Password" className="form-input" name="password"/>
            </div>

            <div>
                <button type="submit" className="btn btn-lg w-full">
                    Login
                </button>
            </div>
        </form>

        <div className="text-center text-gray-300 mt-5">
            Don't have an account? <Link to='/register' className="text-blue-400 hover:underline">Register</Link>
        </div>
    </main></>
}

export default Login;