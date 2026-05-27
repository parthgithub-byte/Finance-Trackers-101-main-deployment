import React from 'react';
import { Navigate } from 'react-router-dom';

/** Redirects to /signin if user_id is not in localStorage. */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isLoggedIn = !!localStorage.getItem('user_id');
  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

export default ProtectedRoute;
