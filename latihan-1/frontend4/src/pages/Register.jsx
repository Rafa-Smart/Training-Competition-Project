import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/auth";
import { showError, showSuccess } from "../utils/alert";

const Register = () => {
  const { register, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    password: "",
    is_private: false,
  });
  const navigate = useNavigate();

  if (user) {
    navigate(`/users/${user.username}`);
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type == "checkbox" ? checked : value,
    });

    // ini bagus sih tapi opsiona aja

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrors({});
    setIsLoading(true);

    if (confirmPassword != formData.password) {
      showError("not match pasword and confirm password");
      setConfirmPassword("");
      setPassword("");
      return null;
    }

    const result = await register(formData);
    if (result.success) {
      navigate("/");
      showSuccess("register success");
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
                  {/* jadi data nya dari errr itu dari register request ya yang berbentuk objek */}
                  {/* {
  username: ["The username field is required."],
  password: ["The password field must be at least 6 characters."]

  yang validator itu
} */}

                  {/* nh jadi unttuk itu kan kita akan ambi valurnya aja, berati nantiitu kan mnejadi
                  ketika kita pake object.values
[
  ["error1"],
  ["error2"]
] 

kemudin fungsi flat itu membuat sebuah 
["error1", "error2"]

baru deh d map
*/}
                  {errors &&
                    Object.values(errors)
                      .flat()
                      .map((error, index) => {
                        return (
                          <div
                            className="alert alert-danger alert-dismissible fade show"
                            role="alert"
                          >
                            {error}
                            <button
                              className="btn btn-close"
                              type="button"
                              onClick={() => setErrors({})}
                            ></button>
                          </div>
                        );
                      })}
                  <div className="mb-2">
                    <label htmlFor="full_name">Full Name</label>
                    <input
                      onChange={handleChange}
                      value={formData.full_name}
                      type="text"
                      className="form-control"
                      id="full_name"
                      name="full_name"
                    />
                  </div>
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
                  <div className="mb-3">
                    <label htmlFor="password">Confirm Password</label>
                    <input
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      value={confirmPassword}
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      onChange={handleChange}
                      value={formData.bio}
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
                      type="checkbox"
                      id="is_private"
                      name="is_private"
                      onChange={handleChange}
                      value={formData.is_private}
                    />
                    <label htmlFor="is_private">Private Account</label>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-sm me-2"></span>{" "}
                        registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </button>
                </form>
              </div>
            </div>
            <div className="text-center mt-4">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
