import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));

    if (!user || !user.accessToken) {
        // Redirect to login if no user or token found
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;
