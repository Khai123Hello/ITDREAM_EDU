import React from 'react';

import AppHeader from './desktop/AppHeader';
import AppBody from './AppBody';
import AppFooter from './AppFooter';

const PublicLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f0fdf4' }}>
            <AppHeader />
            <AppBody>{children}</AppBody>
            <AppFooter />
        </div>
    );
};

export default PublicLayout;
