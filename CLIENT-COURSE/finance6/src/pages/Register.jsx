import { useState } from "react";
import { authApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

import AlertError from "../utils/AlertError";

export default Register = () => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmittig] = useState(false);
  const [errors, setErrors] = useState([]);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChage = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmittig(true);
    setErrors([]);
    try {
      const { token, ...userData } = await authApi.register(form);
      loginUser(userData, token);
      navigate("/");
    } catch (e) {
      setErrors(parseErrors(e) || ["terjadi kesalahan"]);
    } finally {
      setSubmittig(false);
    }
  };

  return (
    <>
      <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          action
          method="POST"
          className="max-w-[500px] mx-auto w-full flex flex-col gap-5"
        >
          <AlerError messages={errors}></AlerError>
          <h2 className="text-2xl font-semibold text-center">Register</h2>
          <div className="rounded-xl overflow-hidden">
            <input
              value={form.full_name}
              onChange={handleChage}
              id="full_name"
              type="text"
              placeholder="full_name"
              className="form-input"
              name="full_name"
            />
            <input
              value={form.email}
              onChange={handleChage}
              id="email"
              type="email"
              placeholder="Email"
              className="form-input"
              name="email"
            />
            <input
              value={form.password}
              onChange={handleChage}
              id="password"
              type="password"
              placeholder="Password"
              className="form-input"
              name="password"
            />
          </div>
          <div>
            <button type="submit" className="btn btn-lg w-full">
              {submitting ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
        <div className="text-center text-gray-300 mt-5">
          Already registered?{" "}
          <Link to={"/login"} className="text-blue-400 hover:underline">
            Login
          </Link>
        </div>
      </main>
    </>
  );
};
