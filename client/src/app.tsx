import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import MyOrdersPage from './pages/MyOrdersPage/MyOrdersPage';
import AdminLoginPage from './pages/AdminLoginPage/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage/AdminDashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import NotFound from './pages/NotFound/NotFound';
import { authApi } from './api';

const RequireAuth = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  if (!authApi.isLoggedIn()) {
    return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace />;
  }
  if (adminOnly && !authApi.isAdmin()) {
    return <Navigate to="/my-customers" replace />;
  }
  return <>{children}</>;
};

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="my-customers" element={<RequireAuth><MyOrdersPage /></RequireAuth>} />
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<RequireAuth adminOnly><AdminDashboardPage /></RequireAuth>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
