import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    password: "",
    is_private: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate(`/users/${user.username}`);
    return null;
  }

  const handleChange = (e) => {
    // jadi gini loh, tiap intpuan itu kan pasti
    // dia punya defualt atribut kaya gini, makanya bisa kita ambil
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,

      //   nae ini tuh dinamis ya, karena bisa apa aja
      // Fungsi [name] adalah untuk memberitahu JavaScript: "Jangan gunakan kata 'name' sebagai
      // nama kunci, tapi ambil isi/nilai dari variabel name tersebut sebagai kuncinya."
      [name]: type === "checkbox" ? checked : value,
      //   Kalau checkbox → ambil checked (true/false)
      //   Kalau input biasa → ambil value
    });

    // mirip kaya gini
    //     javascript
    // var obj = {};
    // var key = "email";
    // obj[key] = "test@mail.com"; // Harus dibuat terpisah
    // Use code with caution.

    // Dengan Computed Property (ES6+, yang kamu gunakan):
    // javascript
    // var key = "email";
    // var obj = {
    //   [key]: "test@mail.com" // Langsung di dalam deklarasi objek
    // };

    // Clear error for this field
    if (errors[name]) {
      // errors[name] itu datangnya dri sini ya
      // setErrors(result.errors || { general: "Registration failed" });
      // dan dari backend itu ngirim ini
      // baru di simpan di state
      //         $request->validate([
      //   'username' => 'required|unique:users',
      //   'password' => 'required|min:6',
      // ]);



      // jadi eknapa kita pake ini, karena tiap kali kita salah
      // kana ada tuh erroya di bawah, nah kita bis pake ini
      // jdi pas user ngetik lagi nanti errornya ilang / null

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

    const result = await register(formData);


    // ini dat dari register
          
    //   return { success: true };
    // } catch (error) {
    //   return { 
    //     success: false, 
    //     errors: error.response?.data?.errors || {} 
    //   };


    if (result.success) {
      navigate("/");
    } else {
      setErrors(result.errors || { general: "Registration failed" });
    }

    setIsLoading(false);
  };


//   kita pake {errors.password[0]}
// karna datan errrsnya itu ini
// {
//   username: ["error1", "error2"],
//   password: ["error3"]
// }


// nah kalo mau kita ambil data errornya, makakita bisa bah jadi Object.values(errors)
// ini akna menghasilkan array dari valuenya, tpi kita juga ingin agar valuenya tu bukan array lagi
// tapi emang item, makanya kti chain lagi pake .flat() untuk meratakan
// array bertingkat
// liat ini https://chatgpt.com/c/69593822-8674-8320-9410-f072cc99569f
// flat(depth?: 1 | undefined): any[]
// The maximum recursion depth
// Returns a new array with all sub-array elements concatenated into it recursively up to the specified depth.

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Register</h2>

              {errors.general && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  {errors.general}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setErrors({})}
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {errors &&
                  Object.values(errors).flat().map((error, index) => {
                    return <div  className="alert alert-dismissible fade show alert-danger">{error}
                        <button className="btn-close" type="button" onClick={() => setErrors({})}></button>
                    </div>
                  })}

                <div className="mb-3">
                  <label htmlFor="full_name" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.full_name ? "is-invalid" : ""
                    }`}
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                  {errors.full_name && (
                    <div className="invalid-feedback">
                      {errors.full_name[0]}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.username ? "is-invalid" : ""
                    }`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <div className="form-text">
                    Minimum 3 characters. Only letters, numbers, dots and
                    underscores allowed.
                  </div>
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username[0]}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">
                    Bio *
                  </label>
                  <textarea
                    className={`form-control ${errors.bio ? "is-invalid" : ""}`}
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    maxLength="100"
                    rows="2"
                  />
                  <div className="form-text">
                    {formData.bio.length}/100 characters
                  </div>
                  {errors.bio && (
                    <div className="invalid-feedback">{errors.bio[0]}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password *
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                  <div className="form-text">Minimum 6 characters</div>
                  {errors.password && (
                    
                    <div className="invalid-feedback">{errors.password[0]}</div>
                  )}
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="is_private"
                    name="is_private"
                    checked={formData.is_private}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="is_private">
                    Private Account
                  </label>
                  <div className="form-text">
                    When your account is private, only people you approve can
                    see your posts.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
