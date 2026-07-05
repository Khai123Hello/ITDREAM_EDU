import { useCallback, useEffect, useRef, useState } from 'react';
import { sendRequest } from '@services/api';

const useFetch = (apiConfig, { immediate = false, mappingData, params = {}, pathParams = {}, dataBody = {} } = {}) => {
    const [ loading, setLoading ] = useState(false);
    const [ data, setData ] = useState(null);
    const [ error, setError ] = useState(null);
    const isMounted = useRef(true);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const execute = useCallback(
        async ({ onCompleted, onError, ...payload } = {}, cancelType) => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            if (isMounted.current) setLoading(true);
            if (isMounted.current) setError(null);

            try {
                const requestData = payload.dataBody !== undefined ? payload.dataBody : dataBody;
                const { data, status } = await sendRequest(
                    apiConfig,
                    { params, pathParams, data: requestData, ...payload, signal: abortControllerRef.current.signal },
                    cancelType,
                );
                if (status !== 200) {
                    throw data;
                }
                if (isMounted.current && !cancelType) setData(mappingData ? mappingData(data) : data);
                onCompleted && onCompleted(data);
                return data;
            } catch (error) {
                if (error.name === 'CanceledError' || error.message === 'canceled') return error;
                if (isMounted.current && !cancelType) setError(error);
                onError && onError(error);
                return error;
            } finally {
                if (isMounted.current && !cancelType) setLoading(false);
            }
        },
        [ apiConfig ],
    );

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [ execute, immediate ]);

    return { loading, execute, data, error, setData };
};

export default useFetch;
