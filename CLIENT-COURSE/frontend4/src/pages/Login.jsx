import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showError, showSuccess } from "../utils/alert";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });


  // jangan gini, karena bisa berbahaya
  // jadi kti aharus pake yang sekali aja

  // useEffect(() => {
  //     if (user) {
  //   navigate(`/users/${user.username}`);
  //   showSuccess("you already logged");
  //   return;
  // }
  // }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log({ name });
    console.log({ value });

    setFormData({
      ...formData,
      // [name]: [value],
      // gaboleh gitu nanti pas yang password akna gini
      // password : ['12345678]
      [name]: value
    });
  };
  console.log({ formData });
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setIsLoading(true);
    const result = await login(formData);
    if (result.success) {
      showSuccess("login success");
      navigate("/");
    } else {
      console.log(result.errors)
      setErrors(result.errors);   
      showError(result.message || "login failed");

    }
    setIsLoading(false);
    return
  };

  return (
    <>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between bg-transparent py-3">
                <h5 className="mb-0">Login</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {errors &&
                    Object.values(errors)
                      .flat()
                      .map((error, index) => {
                        return (
                          <div
                            key={index}
                            className="alert alert-danger alert-dismissible fade show"
                            role="alert"
                          >
                            {error}
                            {/* disni type harus button
                            jadi ektika kita klik tidak sbutmir ulang
                            karena defualnya itu submit dan langsung akna terbaca leh form */}
                            <button type="button" className="btn btn-close"></button>
                          </div>
                        );
                      })}
                  <div className="mb-2">
                    <label htmlFor="username">Username</label>
                    <input
                      onChange={handleChange}
                      value={formData.username}
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password">Password</label>
                    <input
                      onChange={handleChange}
                      value={formData.password}
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-sm me-2"></span>
                        logging...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </form>
              </div>
            </div>
            <div className="text-center mt-4">
              dont have a account? <Link to="/register">register</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
