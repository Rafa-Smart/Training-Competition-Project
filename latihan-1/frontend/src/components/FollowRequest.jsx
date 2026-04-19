import { useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../api/user';
import { useAuth } from '../context/AuthContext';

const FollowRequest = ({ follower, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await userApi.acceptFollowRequest(follower.username);

      // nah ini tuh ajdi gini, ketika kita di kirimkan fugnis onUpdate
      // maka ingat ini adaalah fungsi yang bisa langusng digunakn dan tanpa parameter serta tanpa return
      // jadi ini tuh void
      // misal ini
      // eketika di file home
      // dia itu akn akna ngirim fungsi ini, nah, isinya itu adalah memfilter data langusung
      // agar yang sudah kita accept dari file followRequest bisa lnagusng hilang data yang sudah di acceptnya yang ada di state di home
      // dan di databasenya juga pasti sudah hilang, karena kita beneran accept dan langung ke databasenya
      // lhat aja kita panggil userApi.acceptFollowRequest
      // dan disini ketika kita klik accept kita ;angusng panggil onUpdatenya
      onUpdate?.();
    } catch (error) {
      console.error('Accept follow request error:', error);
      alert(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card mb-2">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
              <span className="text-white fw-bold">
                {follower.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <Link 
                to={`/users/${follower.username}`} 
                className="text-decoration-none fw-bold text-dark"
              >
                {follower.full_name}
              </Link>
              <div className="text-muted small">@{follower.username}</div>
            </div>
          </div>
          <button 
            className="btn btn-success btn-sm"
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                Accepting...
              </>
            ) : (
              'Accept'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowRequest;