import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { ErrorAlert, SuccessAlert } from "../utils/sweetAlert";

export default Login = () => {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    full_name: "",
    bio: "",
    is_private: "",
  });

  const { user, login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const [value, type, checked, name] = e.target;

    setUserData({
      ...userData,
      [name]: type == "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrors({});

    if (confirmPass != userData.password) {
      ErrorAlert("password salah");
      return;
    }

    const response = await login(userData.username, userData.password);
    if (response.success) {
      navigate("/users/" + user.username);
      SuccessAlert("berhaisl login");
    } else {
      ErrorAlert(response?.message || "gagal login");
      setErrors(response?.errors);
    }

    setIsLoading(false);
  };

  return (
    <>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between bg-transparent py-3">
                <h5 className="mb-0">login</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {Object.values(errors)
                    .flat()
                    .map((error) => {
                      return (
                        <div
                          className="alert alert-dismissile alert-danger fade show"
                          role="alert"
                        >
                          {error}
                          <button
                            className="btn-close btn"
                            type="button"
                            onClick={() => setErrors({})}
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
                 
                  <button
                    disable={isLoading}
                    type="submit"
                    className="btn btn-primary w-100"
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-sm me-2"></span>
                    ) : (
                      <>login</>
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
