import React, { useMemo } from 'react';
import apiConfig from '@constants/apiConfig';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import DashboardDesktop from '@modules/layout/desktop/dashboard';

function DashboardPageContainer() {
    const { profile } = useAuth();

    const simParams = useMemo(() => ({ page: 0, size: 100, paged: true }), []);

    const { data: enrolledRes, loading: simLoading } = useFetch(apiConfig.simulationEnrollment.studentList, {
        immediate: true,
        params: simParams,
        mappingData: (res) => res || {},
    });

    const { data: achievementRes, loading: achLoading } = useFetch(apiConfig.achievement.studentList, {
        immediate: true,
        params: { page: 0, size: 100, paged: true },
        mappingData: (res) => res || {},
    });

    const { data: allSimsRes, loading: allSimsLoading } = useFetch(apiConfig.simulation.guestList, {
        immediate: true,
        params: { page: 0, size: 100, paged: true, status: 1 },
        mappingData: (res) => res?.data || {},
    });

    return (
        <>
            <AppHeader />
            <DashboardDesktop
                profile={profile}
                enrolledSims={enrolledRes?.data?.content || []}
                enrolledUrlBase={enrolledRes?.urlBase || ''}
                achievements={achievementRes?.data?.content || []}
                allSimulations={allSimsRes?.content || []}
                loading={simLoading || achLoading || allSimsLoading}
            />
            <AppFooter />
        </>
    );
}

export default DashboardPageContainer;
