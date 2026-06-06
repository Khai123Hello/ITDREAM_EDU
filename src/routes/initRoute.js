import React, { useEffect } from 'react';
import { storageKeys } from '@constants';
import { getData, setData } from '@utils/localStorage';

const InitRoute = () => {
    useEffect(() => {
        const isVersionReseted = getData(storageKeys.APP_VERSION_RESETED);
        if (!isVersionReseted) {
            setData(storageKeys.APP_VERSION_RESETED, true);
        }
    }, []);
};

export default InitRoute;
