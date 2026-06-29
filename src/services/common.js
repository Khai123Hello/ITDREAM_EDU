import { sendRequest } from './api';

export function renderGetListFetcher(apiConfig, config) {
    return async ({ queryKey, signal }) => {
        const [, params] = queryKey;
        // const { data } = await fetcher(apiConfig, { signal, params, ...config });
        const { data, status } = await sendRequest(apiConfig, { params });
        return data;
    };
}
