import React, { useMemo } from 'react';
import RenderContext from '@components/common/elements/RenderContext';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import LandingPageDesktop from '@modules/layout/desktop/landing';

const LandingPageContainer = ({ title }) => {
    const { data, error, loading, execute } = useFetch(apiConfig.simulation.guestList, {
        immediate: true,
        params: {
            page: 0,
            size: 12,
            status: 1,
        },
        mappingData: (response) => response?.data?.content || [],
    });

    const simulations = useMemo(
        () =>
            (data || []).map((item) => ({
                id: item.id,
                title: item.title,
                thumbnail: item.thumbnail,
                level: item.level,
                duration: item.duration,
                totalParticipant: item.totalParticipant,
                avgStar: item.avgStar,
                organization: item.educator?.organization || {},
                category: item.category,
            })),
        [data],
    );

    const handleRetry = () => {
        execute();
    };

    return (
        <RenderContext
            components={{
                desktop: {
                    defaultTheme: (props) => (
                        <LandingPageDesktop
                            {...props}
                            simulations={simulations}
                            loading={loading}
                            error={error}
                            onRetry={handleRetry}
                        />
                    ),
                },
            }}
        />
    );
};

export default LandingPageContainer;
