import React from 'react';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import JobsDesktop from '@modules/layout/desktop/jobs';

function JobsPageContainer() {
    return (
        <>
            <AppHeader />
            <JobsDesktop />
            <AppFooter />
        </>
    );
}

export default JobsPageContainer;
