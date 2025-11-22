import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PublicRoute from './PublicRoute';
import ProtectedRoute from '../components/ProtectedRoute';
import RouteGuard from './RouteGuard';
import ScrollToTop from './ScrollToTop';

import Signin from '../components/Signin';
import Signup from '../components/Signup';
import Dashboard from '../components/Dashboard';
import Profile from '../components/Profile';

import Students from '../components/Students';
import Teachers from '../components/Teachers';
import Settings from '../components/Settings';

import { Loading } from '../components/ui/Loading';
import './AppRouter.css';

const AppRouter = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="app-router-loading">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
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

      {/* Protected routes - require authentication */}
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
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
    
      <Route 
        path="/admin" 
        element={
          <RouteGuard requiredRole="admin">
            <div>Admin Panel</div>
          </RouteGuard>
        } 
      />

      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />

      {/* 404 page */}
      <Route 
        path="*" 
        element={<div>Страница не найдена</div>} 
      />
      </Routes>
    </>
  );
};

export default AppRouter;
