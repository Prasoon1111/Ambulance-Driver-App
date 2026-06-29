import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, role, authLoading } = useContext(AuthContext);

  if (authLoading) {
    return (
      <section style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </section>
    );
  }

  if (!user || !role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;