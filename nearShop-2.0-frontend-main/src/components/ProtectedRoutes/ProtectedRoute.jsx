import { Navigate } from 'react-router-dom';
// import { role } from '../../constants/constant';
import { jwtDecode } from "jwt-decode";
import { accessToken } from '../../constants/constant';
import { AuthContext } from '../../contexts/authcontext/AuthProvider';
import { useContext } from 'react';
import Loader from '../../Loader/Loader';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const {user,loading} = useContext(AuthContext);
  const role = user;

  if(loading) return <Loader></Loader>;

  if(role==null) return <Navigate to="/login" replace />;



  // console.log('check+'+ currRole + token.exp +" " + token.role +" ");
  // console.log(allowedRoles==currRole);

  if (!(allowedRoles == (role))) return <Navigate to="/login" replace />;
  // console.log( "returning child");
  return children;
};

export default ProtectedRoute;
