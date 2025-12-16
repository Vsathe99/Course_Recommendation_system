import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  return isAuth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
