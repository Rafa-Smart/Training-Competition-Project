import { useState } from "react";
import { useAuth } from "../context/authContext";
import { parseErrors } from "../utils/format";
import { authApi } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

export default Register = () => {
  const [loginUser] = useAuth();

  //   ini yang bsia di paste ke mana aja
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, seterrors] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    try {
      const { token, ...data } = await authApi.login(form);
      loginUser({ token, data });
      navigate("/");
    } catch (e) {
      seterrors(parseErrors(e) || ["terjadi kesalahan"]);
    } finally {
      setLoading(false);
    }
  };
  //   ini yang bsia di paste ke mana aja sampe sini

  return (
    <>
      <main class="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        <form
        onSubmit={handleSubmit}
          action=""
          method="POST"
          class="max-w-[500px] mx-auto w-full flex flex-col gap-5"
        >
          <h2 class="text-2xl font-semibold text-center">Login</h2>
        <AlertError messages={errors}></AlertError>

          <div class="rounded-xl overflow-hidden">
           
            <input
              onChange={handleChange}
              value={form.email}
              id="email"
              type="email"
              placeholder="Email"
              class="form-input"
              name="email"
            />
            <input
              onChange={handleChange}
              value={form.password}
              id="password"
              type="password"
              placeholder="Password"
              class="form-input"
              name="password"
            />
          </div>

          <div>
            <button type="submit" class="btn btn-lg w-full">
              {loading ? "Login" : "Login..."}
            </button>
          </div>
        </form>

        <div class="text-center text-gray-300 mt-5">
          Don't Have An Account?{" "}
          <Link to={"/register"} class="text-blue-400 hover:underline">
            Register
          </Link>
        </div>
      </main>
    </>
  );
};
