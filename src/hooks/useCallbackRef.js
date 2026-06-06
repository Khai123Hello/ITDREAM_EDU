import { useCallback, useEffect, useRef } from 'react';

function useCallbackRef(callback) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    });

    return useCallback((...args) => callbackRef.current?.(...args), []);
}

export default useCallbackRef;
