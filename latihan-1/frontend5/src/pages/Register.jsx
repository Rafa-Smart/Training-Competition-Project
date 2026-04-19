import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { showError, showSuccess } from "../utils/alert";

export default Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const { user, register } = useAuth();
  const [userForm, setUserForm] = useState({
    username: "",
    bio: "",
    is_private: "",
    full_name: "",
    password: "",
  });

  const navigate = useNavigate();
  if (user) {
    navigate("/users/" + user.username);
    return null;
  }

  const handleChange = (e)  => {
    const [name, value, checked, type] = e.target;

    setUserForm({
      ...userForm,
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

    if (userForm.password != confirmPassword) {
      showError("not match pasword and confirm password");
      setConfirmPassword("");   
      return null;
    }

    // ini ga pake try karean kita udah return ya bukan throw
    const response = await register(userForm);
    if (response.success) {
      navigate("/users/" + user.username);
      showSuccess("berhasil register");
    } else {
      showError(result.message || "error register");
      setErrors(result.errors);
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
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      onChange={(e) => setConfirmPassword(e.targe.value)}
                      type="confirmPassword"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
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
                  <button type="submit" className="btn btn-primary w-100">
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-sm me-2"></span>
                        regitering...
                      </>
                    ) : (
                      "register"
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
