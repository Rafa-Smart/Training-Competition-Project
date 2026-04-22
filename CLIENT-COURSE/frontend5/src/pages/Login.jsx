import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { showError, showSuccess } from "../utils/alert";
import { useNavigate } from "react-router";

export default Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const [userForm, setUserForm] = useState({});
  const [errors, setError] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async () => {
    e.preventDefault();
    setIsLoading(true);
    const response = await login(userForm);
    if (response.success) {
      navigate("/users/" + user.username);
      showSuccess("berhasil login");
    } else {
      showError(response.message || "gagla login");
      setError(response.errors);
    }
    setIsLoading(false);
  };

  const handleChange = (e) => {
    const [name, value] = e.target;

    setUserForm({
      ...userForm,
      [name]: value,
    });

    if (errors[name]) {
      setError({
        ...errors,
        [name]: null,
      });
    }
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
                    Object.values(errors).flat.map((error) => {
                      return (
                        <div
                          className="alert alert-danger alert-dismissible fade show "
                          role="alert"
                        >
                          {error}
                          {/* disni type harus button
                            jadi ektika kita klik tidak sbutmir ulang
                            karena defualnya itu submit dan langsung akna terbaca leh form */}
                          <button
                            type="button"
                            className="btn btn-close"
                          ></button>
                        </div>
                      );
                    })}
                  <div className="mb-2">
                    <label htmlFor="username">Username</label>
                    <input
                      onChange={(e) => handleChange(e)}
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password">Password</label>
                    <input
                      onChange={(e) => handleChange(e)}
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-sm me-2"></span>
                        login...
                      </>
                    ) : (
                      "login"
                    )}
                  </button>
                </form>
              </div>
            </div>
            <div className="text-center mt-4">
              Don't have an account? <Link to={"/register"}>Register</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
