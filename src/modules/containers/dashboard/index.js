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

    const { data: organizationList, loading: orgLoading } = useFetch(apiConfig.organization.list, {
        immediate: true,
        mappingData: (res) => res.data?.content || res.data || [],
    });

    const { data: categoriesRes, loading: categoriesLoading } = useFetch(apiConfig.category.autoComplete, {
        immediate: true,
        params: { kind: 1 },
        mappingData: (res) => {
            const data = res?.data;
            return Array.isArray(data) ? data : data?.content || [];
        },
    });

    const { data: jobPostsList, loading: jobsLoading } = useFetch(apiConfig.job.guestList, {
        immediate: true,
        params: { page: 0, size: 1000, paged: true },
        mappingData: (res) => res?.data?.content || res?.data || [],
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
                organizations={organizationList || []}
                categories={categoriesRes || []}
                jobPosts={jobPostsList || []}
                loading={simLoading || achLoading || allSimsLoading || orgLoading || categoriesLoading || jobsLoading}
            />
            <AppFooter />
        </>
    );
}

export default DashboardPageContainer;
