import React, { useMemo } from 'react';
import apiConfig from '@constants/apiConfig';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import DashboardDesktop from '@modules/layout/desktop/dashboard';

function DashboardPageContainer() {
    const { profile } = useAuth();

    const simParams = useMemo(() => ({ pageNumber: 0, pageSize: 10, paged: true }), []);

    const { data: enrolledData, loading: simLoading } = useFetch(apiConfig.simulation.studentList, {
        params: simParams,
        mappingData: (res) => res.data || {},
    });

    const { data: achievementData, loading: achLoading } = useFetch(apiConfig.achievement.studentList, {
        params: { pageNumber: 0, pageSize: 10, paged: true },
        mappingData: (res) => res.data || {},
    });

    return (
        <>
            <AppHeader />
            <DashboardDesktop
                profile={profile}
                enrolledSims={enrolledData?.content || []}
                achievements={achievementData?.content || []}
                loading={simLoading || achLoading}
            />
            <AppFooter />
        </>
    );
}

export default DashboardPageContainer;
