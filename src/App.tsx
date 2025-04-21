import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { useLocation } from 'react-router-dom';
import SideNav from './components/side-nav/SideNav';
import AppRoutes from './routes/AppRoutes';

const App: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <AuthProvider>
      <div style={{ display: 'flex' }}>
        {!isLoginPage && <SideNav />}
        <div style={{ marginLeft: isLoginPage ? 0 : 200, flex: 1, overflowY: 'auto' }}>
          <AppRoutes />
        </div>
      </div>
    </AuthProvider>
  );
};

export default App;
