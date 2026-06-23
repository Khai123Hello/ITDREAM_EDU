import { useCallback, useEffect, useRef, useState } from 'react';
import { sendRequest } from '@services/api';

const useFetch = (apiConfig, { immediate = false, mappingData, params = {}, pathParams = {}, dataBody = {} } = {}) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const initialized = useRef(false);

    const execute = useCallback(
        async ({ onCompleted, onError, ...payload } = {}, cancelType) => {
            setLoading(true);
            setError(null);
            try {
                const requestData = payload.dataBody !== undefined ? payload.dataBody : dataBody;
                const { data, status } = await sendRequest(
                    apiConfig,
                    { params, pathParams, data: requestData, ...payload },
                    cancelType,
                );
                if (status !== 200) {
                    throw data;
                }
                !cancelType && setData(mappingData ? mappingData(data) : data);
                onCompleted && onCompleted(data);
                return data;
            } catch (error) {
                !cancelType && setError(error);
                onError && onError(error);
                return error;
            } finally {
                !cancelType && setLoading(false);
            }
        },
        [apiConfig],
    );

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            // My actual effect logic...
            if (immediate) {
                execute();
            }
        }
    }, [execute, immediate]);

    return { loading, execute, data, error, setData };
};

export default useFetch;
