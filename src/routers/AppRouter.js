import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PublicRoute from './PublicRoute';
import ProtectedRoute from '../components/ProtectedRoute';
import RouteGuard from './RouteGuard';

// Импорт страниц
import Signin from '../components/Signin';
import Signup from '../components/Signup';
import Dashboard from '../components/Dashboard';
import Profile from '../components/Profile';
import Lessons from '../components/Lessons';
import Schedule from '../components/Schedule';
import Students from '../components/Students';
import Teachers from '../components/Teachers';
import ApiTest from '../components/ApiTest';
import { Loading } from '../components/ui/Loading';

const AppRouter = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Loading />
      </div>
    );
  }

  return (
    <Routes>
      {/* Публичные маршруты - доступны только неавторизованным пользователям */}
      <Route 
        path="/signin" 
        element={
          <PublicRoute>
            <Signin />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } 
      />

      {/* Защищенные маршруты - требуют авторизации */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/lessons" 
        element={
          <ProtectedRoute>
            <Lessons />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/schedule" 
        element={
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/students" 
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teachers" 
        element={
          <ProtectedRoute>
            <Teachers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/api-test" 
        element={
          <ProtectedRoute>
            <ApiTest />
          </ProtectedRoute>
        } 
      />

      {/* Маршруты с дополнительными проверками прав */}
      <Route 
        path="/admin" 
        element={
          <RouteGuard requiredRole="admin">
            <div>Admin Panel</div>
          </RouteGuard>
        } 
      />

      {/* Корневой маршрут - перенаправление */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />

      {/* 404 страница */}
      <Route 
        path="*" 
        element={<div>Страница не найдена</div>} 
      />
    </Routes>
  );
};

export default AppRouter;
