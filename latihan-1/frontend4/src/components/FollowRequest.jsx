import { useState } from "react";
import { showConfirm, showError, showSuccess } from "../utils/alert";
import { apiUser } from "../api/user";
import { Link } from "react-router-dom";

const FolowRequest = ({follower, onUpdateFollowRequest}) => {

    const [isLoading, setIsLoading] = useState(false);

    const handeAccept = async () => {
        setIsLoading(true);
        try{    
            await apiUser.acceptRequest(follower.username);
            onUpdateFollowRequest()
            showSuccess("succes accept")
        }catch(error){
            showError(error.response.data.message || "error accept")
        }finally{
            setIsLoading(false)
        }
    }


  return (
    <>
      <div className="request-follow mb-4">
        <h6 className="mb-3">Follow Requests</h6>
        <div className="request-follow-list">
          <div className="card mb-2">
            <div className="card-body d-flex align-items-center justify-content-between p-2">
              <Link to={"/users/"+follower.username}>{follower.username}</Link>
              <button onClick={handeAccept} className="btn btn-primary btn-sm">
                {
                    isLoading ? <>
                        <span className="spinner-border spinner-sm me-2"></span> accepting...
                    </> :'accept'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FolowRequest