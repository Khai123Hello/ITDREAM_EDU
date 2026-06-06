import React from 'react';
import useDevices from '@hooks/useDevices';

import PageNotFound from '../page/PageNotFound';

const Device = ({ desktop, mobile, ...props }) => {
    const { isMobile } = useDevices();
    const ComponentRender = (isMobile ? mobile : desktop) || PageNotFound;
    return <ComponentRender {...props} />;
};

export default Device;
