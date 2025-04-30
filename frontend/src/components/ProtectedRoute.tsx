import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('access_token');
  const getUserRole = (): string | null => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const parsedToken = JSON.parse(jsonPayload);
      return parsedToken.role || null;
    } catch (e) {
      console.error('Failed to parse JWT token', e);
      return null;
    }
  };
  const hasRequiredRole = requiredRole ? getUserRole() === requiredRole : true;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requiredRole && !hasRequiredRole) {
    const role = getUserRole();
    if (role === 'operator') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/chat" replace />;
    }
  }
  return <>{children ? children : <Outlet />}</>;
};

export default ProtectedRoute;