import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types';

interface RoleRouteProps {
    allowedRoles: Role[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
    const user = useAuthStore((state) => state.user);

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
