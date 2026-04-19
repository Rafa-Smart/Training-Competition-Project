import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { ErrorAlert, SuccessAlert } from "../utils/sweetAlert";

export default Register = () => {
  const [userData, setUserData] = useState({
    username: "",
    full_name: "",password:"",
    bio: "",
    is_private: "",
  });

  const { user, register } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const [confirmPass, setConfirmPass] = useState();
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

    const response = await register(userData);
    if (response.success) {
      navigate("/users/" + user.username);
      SuccessAlert("berhaisl register");
    } else {
      ErrorAlert(response?.message || "gagal register");
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
                <h5 className="mb-0">Register</h5>
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
                    <label htmlFor="full_name">Full Name</label>
                    <input
                      onChange={(e) => handleChange(e)}
                      type="text"
                      className="form-control"
                      id="full_name"
                      name="full_name"
                    />
                  </div>
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
                  <div className="mb-3">
                    <label htmlFor="confirmPass">Confirm Password</label>
                    <input
                      type="confirmPass"
                      className="form-control"
                      id="confirmPass"
                      name="confirmPass"
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      onChange={(e) => handleChange(e)}
                      name="bio"
                      id="bio"
                      cols={30}
                      rows={3}
                      className="form-control"
                      defaultValue={""}
                    />
                  </div>
                  <div className="mb-3 d-flex align-items-center gap-2">
                    <input
                      onChange={(e) => handleChange(e)}
                      type="checkbox"
                      id="is_private"
                      name="is_private"
                    />
                    <label htmlFor="is_private">Private Account</label>
                  </div>
                  <button
                    disable={isLoading}
                    type="submit"
                    className="btn btn-primary w-100"
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-sm me-2"></span>
                    ) : (
                      <>Register</>
                    )}
                  </button>
                </form>
              </div>
            </div>
            <div className="text-center mt-4">
              Already have an account? <Link to={"/login"}>Login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
