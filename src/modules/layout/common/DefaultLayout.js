import React, { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiConfig from '@constants/apiConfig';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import useFetchAction from '@hooks/useFetchAction';
import { removeCacheAccessToken, removeCacheToken, setCacheAccessToken } from '@services/userService';
import { accountActions } from '@store/actions';

import AppHeader from './desktop/AppHeader';
import AppBody from './AppBody';
import AppFooter from './AppFooter';

import styles from './DefaultLayout.module.scss';
const SIDEBAR_WIDTH_EXPAND = 320;

const DefaultLayout = ({ children, title, layoutProps }) => {
    const { execute: executeLogout } = useFetch(apiConfig.account.logout);
    const { execute } = useFetch(apiConfig.account.login);

    const { execute: executeGetProfile } = useFetchAction(accountActions.getProfile, {
        loading: useFetchAction.LOADING_TYPE.APP,
    });
    const { execute: executeUploadImage } = useFetch(apiConfig.file.upload);
    const { profile } = useAuth();
    const { execute: executeUpdateProfile } = useFetch(apiConfig.user.updateProfile, {});
    const dispatch = useDispatch();
    const [ openModal, setOpen ] = useState(false);
    const [ openModalProfile, setOpenProfile ] = useState(false);
    const collapsed = useSelector((state) => state.app.collapse);
    const handleSubmitProfile = (value, image) => {
        executeUpdateProfile({
            data: {
                ...value,
                id: profile.id,
                avatarPath: image,
            },
            onCompleted: () => {
                toast.success('Update profile success !');
                executeGetProfile();
                setOpenProfile(false);
            },
            onError: () => toast.error('Update profile fail !'),
        });
    };

    return (
        <Fragment>
            <div className={styles.masterLayout}>
                <AppHeader
                    profile={profile}
                    openModal={openModal}
                    setOpen={setOpen}
                    openModalProfile={openModalProfile}
                    setOpenProfile={setOpenProfile}
                    executeUploadImage={executeUploadImage}
                    handleSubmitProfile={handleSubmitProfile}
                    collapsed={collapsed}
                    // onCollapse={toggleCollapsed}
                />
                <div className={styles.appContent}>{children}</div>
                <AppFooter />
            </div>
        </Fragment>
    );
};

export default DefaultLayout;
