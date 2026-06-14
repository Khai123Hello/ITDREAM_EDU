import React, { useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { appAccount, UserTypes } from '@constants';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { showErrorMessage } from '@services/notifyService';
import {
    removeCacheToken,
    removeCacheUserEmail,
    removeCacheUserKind,
    setCacheToken,
    setCacheUserEmail,
    setCacheUserKind,
} from '@services/userService';
import { accountActions } from '@store/actions';
import { Buffer } from 'buffer';

const message = defineMessages({
    loginFail: 'Sai tên đăng nhập hoặc mật khẩu !!!',
    loginNoAccess: 'Loại tài khoản không phù hợp!!!',
});

window.Buffer = window.Buffer || Buffer;

const useAppLogin = (role = 'student') => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [ loadingProfileFetch, setLoadingProfileFetch ] = useState(false);

    const base64Credentials = useMemo(() => {
        return typeof window !== 'undefined' && typeof window.btoa === 'function'
            ? window.btoa(`${appAccount.APP_USERNAME}:${appAccount.APP_PASSWORD}`)
            : typeof Buffer !== 'undefined'
                ? Buffer.from(`${appAccount.APP_USERNAME}:${appAccount.APP_PASSWORD}`).toString('base64')
                : '';
    }, []);

    const { execute: executeLogin, loading: loadingLogin } = useFetch(apiConfig.account.loginOAuth);
    const { execute: executeGoogleLogin, loading: loadingGoogleLogin } = useFetch(apiConfig.account.loginBasic);

    const handleLoginSuccess = async (responseLogin, email) => {
        const userKind = responseLogin.user_kind;

        // Validate if user is indeed a Student
        if (userKind !== UserTypes.STUDENT) {
            showErrorMessage(translate.formatMessage(message.loginNoAccess));
            return;
        }

        // Lưu cả accessToken + refreshToken để interceptor có thể tự refresh khi token hết hạn
        setCacheToken(responseLogin.access_token, responseLogin.refresh_token);
        if (email) {
            setCacheUserEmail(email);
        }
        setCacheUserKind(userKind);
        setLoadingProfileFetch(true);

        const profileConfig = apiConfig.account.getProfileStudent;

        const apiFetchProfile = {
            baseURL: profileConfig.baseURL,
            method: profileConfig.method,
            headers: {
                ...profileConfig.headers,
                Authorization: `Bearer ${responseLogin.access_token}`,
            },
        };

        // Trigger direct fetch
        try {
            const profileRes = await fetch(apiFetchProfile.baseURL, {
                method: apiFetchProfile.method,
                headers: apiFetchProfile.headers,
            });
            const profileData = await profileRes.json();

            setLoadingProfileFetch(false);
            if (profileData && (profileData.result === true || profileData.data !== undefined)) {
                const payload = profileData.data !== undefined ? profileData : { data: profileData };
                dispatch(accountActions.getProfileSuccess(payload));
                navigate('/dashboard');
            } else {
                showErrorMessage(translate.formatMessage(message.loginFail));
                removeCacheToken();
                removeCacheUserKind();
                removeCacheUserEmail();
            }
        } catch (error) {
            setLoadingProfileFetch(false);
            showErrorMessage(translate.formatMessage(message.loginFail));
            removeCacheToken();
            removeCacheUserKind();
            removeCacheUserEmail();
        }
    };

    const handleLogin = (values) => {
        const formParams = new URLSearchParams();
        formParams.append('grant_type', 'student');
        formParams.append('email', values.email);
        formParams.append('password', values.password);

        executeLogin({
            data: formParams.toString(),
            authorization: `Basic ${base64Credentials}`,
            onCompleted: (responseLogin) => handleLoginSuccess(responseLogin, values.email),
            onError: (error) => {
                showErrorMessage(translate.formatMessage(message.loginFail));
                console.error('Login error:', error);
            },
        });
    };

    const handleGoogleLogin = (accessToken) => {
        executeGoogleLogin({
            data: {
                accessToken: accessToken,
                grant_type: 'student',
            },
            authorization: `Basic ${base64Credentials}`,
            onCompleted: (responseLogin) => handleLoginSuccess(responseLogin, ''),
            onError: (error) => {
                showErrorMessage(translate.formatMessage(message.loginFail));
                console.error('Google Login error:', error);
            },
        });
    };

    return {
        loading: loadingLogin || loadingProfileFetch || loadingGoogleLogin,
        handleLogin,
        handleGoogleLogin,
    };
};

export default useAppLogin;
