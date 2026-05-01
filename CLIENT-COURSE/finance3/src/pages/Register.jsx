import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseErrors } from "../utils/format";
import { authApi } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default Register = () => {

    const [loginUser] = useAuth();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate()
    const [form, setForm] = useState({
        full_name:'',
        email:"",
        password:''
    });


    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]:e.target.value
        });
        setErrors([])
    };


    const handleSubmit = async(e) => {
        setLoading(true);
        setErrors([])
        try {
            const {token, ...user} = await authApi.register(form);
            // karena didalam laravelnya itu ada toke dan banyak atribut dari user ya
            // jadi engga obek user langsung makanya kita pake spread;

            loginUser(token, user);
            navigate('/')
        }catch(e){
            setErrors(parseErrors(e.data?.response?.errors) || ['terjadi kesalaahan']);

        }finally{
            setLoading(false)
        }
    }

  return (
    <>
      <main class="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <form
          action=""
          method="POST"
          class="max-w-[500px] mx-auto w-full flex flex-col gap-5"
        >
          <h2 class="text-2xl font-semibold text-center">Register</h2>

          <div class="rounded-xl overflow-hidden">
            <input
              id="name"
              type="text"
              placeholder="Name"
              class="form-input"
              name="name"
            />
            <input
              id="email"
              type="email"
              placeholder="Email"
              class="form-input"
              name="email"
            />
            <input
              id="password"
              type="password"
              placeholder="Password"
              class="form-input"
              name="password"
            />
          </div>

          <div>
            <button type="submit" class="btn btn-lg w-full">
              Register
            </button>
          </div>
        </form>

        <div class="text-center text-gray-300 mt-5">
          Already registered?{" "}
          <a href="login.html" class="text-blue-400 hover:underline">
            Login
          </a>
        </div>
      </main>
    </>
  );
};
