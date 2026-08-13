import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import MyOrdersPage from './pages/MyOrdersPage/MyOrdersPage';
import AdminLoginPage from './pages/AdminLoginPage/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage/AdminDashboardPage';
import NotFound from './pages/NotFound/NotFound';
import { authApi } from './api';

// 登录守卫：已登录用户不能访问登录页
const LoginGuard = ({ children }: { children: React.ReactNode }) => {
  if (authApi.isLoggedIn()) {
    const user = authApi.getCurrentUser();
    if (user?.role === 'super_admin' || user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/my-customers" replace />;
  }
  return <>{children}</>;
};

// 员工页面守卫
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  if (!authApi.isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// 管理员页面守卫（super_admin 和 admin 都可以进入）
const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  if (!authApi.isLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  const user = authApi.getCurrentUser();
  if (user?.role !== 'super_admin' && user?.role !== 'admin') {
    return <Navigate to="/my-customers" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={
          <LoginGuard>
            <LandingPage />
          </LoginGuard>
        } />
        <Route path="login" element={<LoginPage />} />
        <Route path="my-customers" element={
          <RequireAuth>
            <MyOrdersPage />
          </RequireAuth>
        } />
        <Route path="admin/login" element={
          <LoginGuard>
            <AdminLoginPage />
          </LoginGuard>
        } />
        <Route path="admin" element={
          <RequireAdmin>
            <AdminDashboardPage />
          </RequireAdmin>
        } />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
