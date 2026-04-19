import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../api/user';
import { useAuth } from '../context/AuthContext';

const UserCard = ({ user: userData, showFollowButton = true, onFollowUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      await userApi.followUser(userData.username);
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

      onFollowUpdate?.();
    } catch (error) {
      console.error('Follow error:', error);
      if (error.response?.status === 422) {
        alert(error.response.data.message);
      }
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
                {userData.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <Link 
                to={`/users/${userData.username}`} 
                className="text-decoration-none fw-bold text-dark"
              >
                {userData.full_name}
              </Link>
              <div className="text-muted small">@{userData.username}</div>
              <div className="text-muted small">{userData.bio}</div>
            </div>
          </div>
          
          {showFollowButton && currentUser && currentUser.id !== userData.id && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleFollow}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Following...
                </>
              ) : (
                'Follow'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;