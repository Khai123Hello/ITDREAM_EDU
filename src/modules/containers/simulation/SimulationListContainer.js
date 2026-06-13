import React, { useCallback, useMemo, useState } from 'react';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useQueryParams from '@hooks/useQueryParams';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import SimulationListDesktop from '@modules/layout/desktop/simulation/SimulationListDesktop';

/**
 * SimulationListContainer
 * Fetch simulation list, manage filters, pagination
 */
function SimulationListContainer() {
    const { params, setQueryParams, deserializeParams } = useQueryParams();
    const [filters, setFilters] = useState({
        title: params.get('title') || '',
        level: params.get('level') ? parseInt(params.get('level'), 10) : undefined,
        categoryId: params.get('categoryId') ? parseInt(params.get('categoryId'), 10) : undefined,
    });
    const [pagination, setPagination] = useState({
        pageNumber: params.get('pageNumber') ? parseInt(params.get('pageNumber'), 10) : 0,
        pageSize: params.get('pageSize') ? parseInt(params.get('pageSize'), 10) : 16,
    });

    // Fetch simulation list
    const queryParams = useMemo(
        () => ({
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
            paged: true,
            status: 1,
            ...(filters.title && { title: filters.title }),
            ...(filters.level !== undefined && { level: filters.level }),
            ...(filters.categoryId !== undefined && { categoryId: filters.categoryId }),
        }),
        [pagination, filters],
    );

    const {
        data: simList,
        loading: simLoading,
        error: simError,
        execute: refetchSim,
    } = useFetch(apiConfig.simulation.guestList, {
        params: queryParams,
        mappingData: (res) => res.data || {},
    });

    // Fetch categories for filter
    const { data: categoryList, loading: catLoading } = useFetch(apiConfig.category.autoComplete, {
        immediate: true,
        params: { kind: 1 },
        mappingData: (res) => res.data?.content || [],
    });

    const handleFilterChange = useCallback(
        (newFilters) => {
            setFilters(newFilters);
            setPagination({ ...pagination, pageNumber: 0 });
            setQueryParams({
                title: newFilters.title || '',
                level: newFilters.level ? String(newFilters.level) : '',
                categoryId: newFilters.categoryId ? String(newFilters.categoryId) : '',
                pageNumber: '0',
                pageSize: String(pagination.pageSize),
            });
        },
        [pagination.pageSize, setQueryParams],
    );

    const handlePaginationChange = useCallback(
        (pageNumber, pageSize) => {
            setPagination({ pageNumber: pageNumber - 1, pageSize });
            setQueryParams({
                ...deserializeParams(params),
                pageNumber: String(pageNumber - 1),
                pageSize: String(pageSize),
            });
        },
        [params, setQueryParams],
    );

    const handleRetry = useCallback(() => {
        refetchSim();
    }, [refetchSim]);

    // Fetch simulation list on mount and when filters change
    React.useEffect(() => {
        refetchSim();
    }, [queryParams, refetchSim]);

    return (
        <>
            <AppHeader />
            <SimulationListDesktop
                simulations={simList?.content || []}
                categories={categoryList}
                loading={simLoading || catLoading}
                error={simError}
                onRetry={handleRetry}
                filters={filters}
                onFilterChange={handleFilterChange}
                pagination={{
                    current: pagination.pageNumber + 1,
                    pageSize: pagination.pageSize,
                    total: simList?.totalElements || 0,
                }}
                onPaginationChange={handlePaginationChange}
            />
            <AppFooter />
        </>
    );
}

export default SimulationListContainer;
