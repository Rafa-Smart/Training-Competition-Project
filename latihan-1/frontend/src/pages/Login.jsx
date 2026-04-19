import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {

    // nah disni jgua harus kita pasang ya
    // tapi ga bisa
    // jadi lihat aja ini
    // https://chatgpt.com/c/69593af5-ae0c-8322-bff4-f4874a599182

    navigate(`/users/${user.username}`);
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,


    //   nah ini juga ya, jdai name e.target.name itu dinamis dan ngambil dari inputan
      [e.target.name]: e.target.value
    });
  };

//   disni kita baut fungsi untuk delay
// tapi delanya juga dalam bentuk promise, jadi bisa sebanding dengn fungis login
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
        // setTimeout(() => {
        //     setIsLoading(false)
        //     navigate('/');
        // }, 4000)


        // Spinner Anda tidak lama karena delay tidak menjadi bagian dari async flow.


        // await delay(4000)
        navigate('/')

    } else {

        // nah errornya itu dimasuki dari sini ya
      setError(result.message);
    }
    

  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Login</h2>
              
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
              
              <div className="text-center mt-3">
                <p className="mb-0">
                  Don't have an account? <Link to="/register">Register</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;