import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";
import { parseErrors } from "../utils/format";
import { useNavigate } from "react-router-dom";

export default Login = () => {
  const [form, setForm] = useState({ 
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    setLoading(true);
    setErrors([]);
    e.preventDefault();

    try {
      const { token, ...data } = await authApi.login(form);
      loginUser(data, token);
      navigate("/");
    } catch (e) {
      setErrors(parseErrors(e) || ["terjadi kesalahan"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
      <form
      onSubmit={handleSubmit}
        action
        method="POST"
        className="max-w-[500px] mx-auto w-full flex flex-col gap-5"
      >
        <h2 className="text-2xl font-semibold text-center">Login</h2>
        <div className="rounded-xl overflow-hidden">
  
          <input
            onChange={(e) => handleChange(e)}
            value={form.email}
            id="email"
            type="email"
            placeholder="Email"
            className="form-input"
            name="email"
          />
          <input
            onChange={(e) => handleChange(e)}
            value={form.password}
            id="password"
            type="password"
            placeholder="Password"
            className="form-input"
            name="password"
          />
        </div>
        <div>
          <button type="submit" className="btn btn-lg w-full">
            {loading ? "registering..." : "register"}
          </button>
        </div>
      </form>
      <div className="text-center text-gray-300 mt-5">
        Don't Have an account?{" "}
        <Link to="/register" className="text-blue-400 hover:underline">
          Register
        </Link>
      </div>
    </main>
  );
};
