import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { navigateTypeEnum } from '@constants';

const AppNavigate = () => {
    const navigateType = useNavigationType();
    const location = useLocation();
    const root = document.getElementById('root');
    const prevPath = useRef(location.pathname);
    useEffect(() => {
        if (navigateType !== navigateTypeEnum.POP && prevPath.current !== location.pathname) {
            root.scrollTop = 0;
        }
        if (location.pathname.includes('availability')) root.scrollTop = 0;
    }, [location.pathname, navigateType]);

    return <Outlet />;
};

export default AppNavigate;
