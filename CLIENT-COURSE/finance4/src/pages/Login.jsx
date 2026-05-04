import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";
import { useNavigate } from "react-router-dom";
import AlertError from "../utils/AlertError";

export default Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const { user, loginUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, ...user } = await authApi.login(form);
      //   ingat ya karena stu objek nih antara token dan user itu makanya kita pake ini aja
      await loginUser({ token, user });
      navigate("/");
    } catch (e) {
      setErrors(parseErrors(e?.response?.data?.errors) || ['terjadi kesalahan']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <form
          action
          method="POST"
          className="max-w-[500px] mx-auto w-full flex flex-col gap-5"
        >
          <h2 className="text-2xl font-semibold text-center">login</h2>

          <AlertError messages={errors}></AlertError>
          <div className="rounded-xl overflow-hidden">

            <input
              id="email"
              onChange={handleChange}
              value={form.email}
              type="email"
              placeholder="Email"
              className="form-input"
              name="email"
            />
            <input
              id="password"
              onChange={handleChange}
              value={form.password}
              type="password"
              placeholder="Password"
              className="form-input"
              name="password"
            />
          </div>
          <div>
            <button type="submit" className="btn btn-lg w-full">
              {loading ? "Logging..." : "Login"}
            </button>
          </div>
        </form>
        <div className="text-center text-gray-300 mt-5">
          Don't Have an Account?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </div>
      </main>
    </>
  );
};
