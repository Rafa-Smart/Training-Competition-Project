import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // disini kita replce agar dia tidka bisa baliklagi ke halaman sebelumnya
    // dan ini emang yang ada di api specnya
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;