import React, { useCallback, useMemo, useState } from 'react';
import apiConfig from '@constants/apiConfig';
import { DEFAULT_PAGE_SIZE, MAX_SIMULATIONS_LOAD_LIMIT } from '@constants';
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
    const [ filters, setFilters ] = useState({
        title: params.get('title') || '',
        level: params.get('level') ? parseInt(params.get('level'), 10) : undefined,
        categoryId: params.get('categoryId') ? parseInt(params.get('categoryId'), 10) : undefined,
        organizationId: params.get('organizationId') ? parseInt(params.get('organizationId'), 10) : undefined,
        avgStar: params.get('avgStar') ? parseFloat(params.get('avgStar')) : undefined,
        sort: params.get('sort') || 'createdDate,desc',
    });
    const [ pagination, setPagination ] = useState({
        page: params.get('page') ? parseInt(params.get('page'), 10) : 0,
        size: params.get('size') ? parseInt(params.get('size'), 10) : DEFAULT_PAGE_SIZE,
    });

    // Fetch simulation list (Lấy toàn bộ kết quả phù hợp từ BE để FE phân trang/lọc/sort chính xác)
    const queryParams = useMemo(
        () => ({
            page: 0,
            size: MAX_SIMULATIONS_LOAD_LIMIT,
            paged: true,
            status: 1,
            ...(filters.title && { title: filters.title }),
            ...(filters.level !== undefined && { level: filters.level }),
            ...(filters.categoryId !== undefined && { categoryId: filters.categoryId }),
            ...(filters.organizationId !== undefined && { organizationId: filters.organizationId }),
        }),
        [ filters.title, filters.level, filters.categoryId, filters.organizationId ],
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

    // Fetch organizations for filter
    const { data: organizationList, loading: orgLoading } = useFetch(apiConfig.organization.guestList, {
        immediate: true,
        mappingData: (res) => res.data?.content || res.data || [],
    });

    // Lọc và sắp xếp ở phía FE để tránh lỗi BE (BE chỉ hỗ trợ lọc avgStar chính xác tuyệt đối và bị hardcode sắp xếp theo ngày tạo)
    const processedList = useMemo(() => {
        let list = simList?.content || [];

        // 1. Lọc theo categoryId (Lĩnh vực)
        if (filters.categoryId !== undefined) {
            list = list.filter((sim) => sim.category?.id == filters.categoryId);
        }

        // 3. Lọc theo level (Mức độ)
        if (filters.level !== undefined) {
            list = list.filter((sim) => sim.level == filters.level);
        }

        // 4. Lọc theo avgStar (từ mức sao được chọn trở lên)
        if (filters.avgStar !== undefined) {
            list = list.filter((sim) => (sim.avgStar || 0) >= filters.avgStar);
        }

        // 5. Sắp xếp theo yêu cầu
        if (filters.sort === 'totalParticipant,desc') {
            list = [ ...list ].sort((a, b) => (b.totalParticipant || 0) - (a.totalParticipant || 0));
        } else if (filters.sort === 'avgStar,desc') {
            list = [ ...list ].sort((a, b) => (b.avgStar || 0) - (a.avgStar || 0));
        } else {
            // Mặc định: Mới nhất (createdDate,desc)
            list = [ ...list ].sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0));
        }

        return list;
    }, [ simList, filters.categoryId, filters.organizationId, filters.level, filters.avgStar, filters.sort ]);

    const total = processedList.length;

    const paginatedList = useMemo(() => {
        const startIndex = pagination.page * pagination.size;
        return processedList.slice(startIndex, startIndex + pagination.size);
    }, [ processedList, pagination.page, pagination.size ]);

    const handleFilterChange = useCallback(
        (newFilters) => {
            setFilters(newFilters);
            setPagination((prev) => ({ ...prev, page: 0 }));
            setQueryParams({
                title: newFilters.title || '',
                level: newFilters.level ? String(newFilters.level) : '',
                categoryId: newFilters.categoryId ? String(newFilters.categoryId) : '',
                organizationId: newFilters.organizationId ? String(newFilters.organizationId) : '',
                avgStar: newFilters.avgStar ? String(newFilters.avgStar) : '',
                sort: newFilters.sort || 'createdDate,desc',
                page: '0',
                size: String(pagination.size),
            });
        },
        [ pagination.size, setQueryParams ],
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
        [ params, setQueryParams, deserializeParams ],
    );

    const handleRetry = useCallback(() => {
        refetchSim({ params: queryParams });
    }, [ queryParams, refetchSim ]);

    // Fetch simulation list on mount and when filters change
    React.useEffect(() => {
        refetchSim({ params: queryParams });
    }, [ queryParams, refetchSim ]);

    return (
        <>
            <AppHeader />
            <SimulationListDesktop
                simulations={paginatedList}
                categories={categoryList}
                organizations={organizationList}
                loading={simLoading || catLoading || orgLoading}
                error={simError}
                onRetry={handleRetry}
                filters={filters}
                onFilterChange={handleFilterChange}
                pagination={{
                    current: pagination.page + 1,
                    pageSize: pagination.size,
                    total: total,
                }}
                onPaginationChange={handlePaginationChange}
            />
            <AppFooter />
        </>
    );
}

export default SimulationListContainer;
