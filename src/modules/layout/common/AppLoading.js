import React from 'react';
import { useSelector } from 'react-redux';
import Loading from '@components/common/loading';
import { selectAppLoading } from '@selectors/app';

const AppLoading = () => {
    const appLoading = useSelector(selectAppLoading);

    return <Loading show={appLoading} />;
};

export default AppLoading;
