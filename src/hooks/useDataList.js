import { useCallback } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { cleanObject } from '@utils';
import { delayResult } from '@utils/delay-result';

function useDataList({ fetcher, filter, queryOptions, mappingData = (res) => res }) {
    const fetchData = useCallback(
        ({ signal }) =>
            delayResult(
                fetcher({
                    data: cleanObject(
                        {
                            size: 10,
                            ...filter,
                        },
                        { clear: [ undefined, '', null, 0 ] },
                    ),
                    signal: signal,
                }),
                300,
            ).then((res) => res.data),
        [ filter ],
    );

    const { data, isFetching, error, refetch } = useQuery({
        ...queryOptions,
        queryKey: [ filter ],
        queryFn: fetchData,
        select: mappingData,
        placeholderData: keepPreviousData,
    });

    return {
        data: data?.content || data,
        isFetching,
        error,
        refetch,
        totalPages: data?.totalPages,
        totalElements: data?.totalElements,
        currentPage: data?.page,
    };
}

export default useDataList;
