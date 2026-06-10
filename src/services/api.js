import { storageKeys } from '@constants';
import apiConfig from '@constants/apiConfig';
import axios from 'axios';

import {
    getCacheAccessToken,
    getCacheRefreshToken,
    getCacheUserEmail,
    getCacheX_tenant,
    removeCacheToken,
    setCacheToken,
    setCacheX_tenant,
} from './userService';

// Handle refresh token
const axiosInstance = axios.create();
let isRefreshing = false;
let subscribers = [];

const onRefreshed = (newAccessToken) => {
    subscribers.map((cb) => cb(newAccessToken));
};

const subscribeTokenRefresh = (cb) => {
    subscribers.push(cb);
};

axiosInstance.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalConfig = err.config;

        if (originalConfig.url !== apiConfig.account.login.baseURL && err.response) {
            // Access Token was expired
            if (err.response?.status === 403) {
                // removeCacheToken();
            }
            if (err.response?.status === 401 && !originalConfig._retry) {
                const handleExpireAll = () => {
                    // removeCacheToken();
                    // window.location.reload();
                };

                if (!getCacheRefreshToken()) {
                    handleExpireAll();
                    return Promise.reject(err);
                }

                originalConfig._retry = true;
                if (!isRefreshing) {
                    isRefreshing = true;
                    const email = getCacheUserEmail();
                    axiosInstance
                        .post(apiConfig.account.refreshToken.baseURL, {
                            refreshToken: getCacheRefreshToken(),
                            email,
                        })
                        .then((rs) => {
                            const { accessToken, refreshToken } = rs.data.data;
                            setCacheToken(accessToken, refreshToken);
                            isRefreshing = false;
                            onRefreshed(accessToken);
                            subscribers = [];
                        })
                        .catch((_error) => {
                            handleExpireAll();
                            return Promise.reject(_error);
                        });
                }

                return new Promise((resolve) => {
                    subscribeTokenRefresh((newAccessToken) => {
                        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
                        return resolve(axiosInstance(originalConfig));
                    });
                });
            }
        }
        return Promise.reject(err);
    },
);

const sendRequest = (options, payload, cancelToken) => {
    const { params = {}, pathParams = {}, data = {} } = payload;
    let { method, baseURL, headers, ignoreAuth, authorization } = options;
    // Allow callers to provide an `authorization` value in the payload (overrides options)
    if (payload && payload.authorization) {
        authorization = payload.authorization;
    }
    // Ensure headers is an object before mutating
    headers = headers || {};
    const userAccessToken = getCacheAccessToken();
    const tenantId = getCacheX_tenant();
    const arrayPath = window.location.pathname.split('/');
    if (tenantId != arrayPath?.[1]) setCacheX_tenant(arrayPath[1]);

    if (options && options.isRequiredTenantId && !options.isUpload) {
        headers[storageKeys.TENANT_HEADER] = tenantId;
    } else {
        delete headers[storageKeys.TENANT_HEADER];
    }

    if (!ignoreAuth && userAccessToken) {
        headers.Authorization = `Bearer ${userAccessToken}`;
    } else {
        delete headers.Authorization;
    }

    if (authorization) {
        headers.Authorization = authorization;
    }

    // update path params
    for (let key of Object.keys(pathParams)) {
        const keyCompare = `:${key}`;
        if (baseURL.indexOf(keyCompare) !== -1) {
            baseURL = baseURL.replace(keyCompare, pathParams[key]);
        }
    }

    // update path params
    for (let key of Object.keys(pathParams)) {
        const keyCompare = `:${key}`;
        if (baseURL.indexOf(keyCompare) !== -1) {
            baseURL = baseURL.replace(keyCompare, pathParams[key]);
        }
    }

    return axiosInstance.request({
        method,
        baseURL,
        headers,
        params,
        data,
        cancelToken,
    });
};

export { sendRequest };
