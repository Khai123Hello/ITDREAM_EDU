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
        page: params.get('page') ? parseInt(params.get('page'), 10) : 0,
        size: params.get('size') ? parseInt(params.get('size'), 10) : 16,
    });

    // Fetch simulation list
    const queryParams = useMemo(
        () => ({
            page: pagination.page,
            size: pagination.size,
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
            setPagination({ ...pagination, page: 0 });
            setQueryParams({
                title: newFilters.title || '',
                level: newFilters.level ? String(newFilters.level) : '',
                categoryId: newFilters.categoryId ? String(newFilters.categoryId) : '',
                page: '0',
                size: String(pagination.size),
            });
        },
        [pagination.size, setQueryParams],
    );

    const handlePaginationChange = useCallback(
        (page, size) => {
            setPagination({ page: page - 1, size });
            setQueryParams({
                ...deserializeParams(params),
                page: String(page - 1),
                size: String(size),
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
                    current: pagination.page + 1,
                    pageSize: pagination.size,
                    total: simList?.totalElements || 0,
                }}
                onPaginationChange={handlePaginationChange}
            />
            <AppFooter />
        </>
    );
}

export default SimulationListContainer;
