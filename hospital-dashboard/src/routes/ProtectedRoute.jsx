import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, role } = useContext(AuthContext);

  if (!user || !role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
