import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { accessRouteTypeEnum } from '@constants';
import PublicLayout from '@modules/layout/common/PublicLayout';

const ValidateAccess = ({ authRequire, component: Component, componentProps, isAuthenticated, profile, layout }) => {
    const location = useLocation();

    const getRedirect = (authRequire) => {
        if (authRequire === accessRouteTypeEnum.NOT_LOGIN && isAuthenticated) {
            return '/dashboard';
        }

        if (authRequire === accessRouteTypeEnum.REQUIRE_LOGIN && !isAuthenticated) {
            return '/login';
        }

        return false;
    };

    const redirect = getRedirect(authRequire);

    if (redirect) {
        return <Navigate state={{ from: location }} key={redirect} to={redirect} replace />;
    }

    const renderContent = () => (
        <Component {...(componentProps || {})}>
            <Outlet />
        </Component>
    );

    if (layout === 'public') {
        return <PublicLayout>{renderContent()}</PublicLayout>;
    }

    return renderContent();
};

export default ValidateAccess;
