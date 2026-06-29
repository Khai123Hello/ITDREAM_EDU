import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '@components/common/elements/Button';
import { useConfirmModal } from '@components/common/elements/ConfirmModalWrapper';
import Flex from '@components/common/elements/Flex';
import { showErrorMessage } from '@services/notifyService';

import useFetch from './useFetch';
import useNotification from './useNotification';
import useQueryParams from './useQueryParams';
import useTranslate from './useTranslate';

const message = defineMessages({
    createSuccess: 'Create {objectName} success',
    updateSuccess: 'Update {objectName} success',
    yes: 'Yes',
    cancel: 'Cancel',
    create: 'Create',
    update: 'Update',
    title: '{action, select, true {Edit} other {New}} {objectName}',
});

const closeFormMessage = defineMessages({
    closeSuccess: 'Close {objectName} successfully',
    closeTitle: 'Bạn có muốn đóng trang này?',
    ok: 'Có',
    cancel: 'Không',
});

const useSaveBase = ({
    apiConfig = {
        getById: null,
        create: null,
        update: null,
    },
    options = {
        objectName: '',
        getListUrl: '',
    },
    override,
}) => {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    const translate = useTranslate();
    const confirmModal = useConfirmModal();
    const { params: queryParams, setQueryParams } = useQueryParams();
    const [detail, setDetail] = useState({});
    const [detailId, setDetailId] = useState(params.id);
    const [isSubmitting, setSubmit] = useState(false);
    const [isChanged, setChange] = useState(false);
    const [isEditing, setEditing] = useState(params.id === 'create' ? false : true);
    const { execute: executeGet, loading } = useFetch(apiConfig.getById, {
        immediate: false,
    });
    const { execute: executeCreate, loading: loadingCreate } = useFetch(apiConfig.create, { immediate: false });
    const { execute: executeUpdate, loading: loadingUpdate } = useFetch(apiConfig.update, { immediate: false });
    const intl = useIntl();
    const title = intl?.formatMessage
        ? intl.formatMessage(message.title, {
              action: params.id !== 'create',
              objectName: options.objectName,
          })
        : '';
    const notification = useNotification();

    const mappingData = (response) => {
        if (response.result === true) return response.data;
    };

    const handleGetDetailError = (error) => {
        // console.log({ error });
    };

    const handleFetchDetail = (params) => {
        executeGet({
            ...params,
            pathParams: { id: detailId },
            onCompleted: (response) => {
                setDetail(mixinFuncs.mappingData(response));
            },
            onError: mixinFuncs.handleGetDetailError,
        });
    };

    const getDetail = () => {
        mixinFuncs.handleFetchDetail(detailId);
    };

    const getFormId = () => {
        return `form-${location.pathname}`;
    };

    const onBack = (isSuccess = true) => {
        const doBack = () => {
            if (location?.state?.prevPath === options.getListUrl) {
                navigate(
                    location?.state?.prevPath + location.search,
                    isSuccess && {
                        state: { listData: location.state.listData },
                    },
                );
            } else {
                navigate(options.getListUrl);
            }
        };
        doBack();
    };

    const prepareCreateData = (data) => {
        return data;
    };

    const prepareUpdateData = (data) => {
        return {
            ...data,
            id: detail.id,
        };
    };

    const onSave = (values, callback) => {
        setSubmit(true);
        if (isEditing) {
            executeUpdate({
                data: mixinFuncs.prepareUpdateData(values),
                onCompleted: mixinFuncs.onSaveCompleted,
                onError: (err) => mixinFuncs.onSaveError(err, callback),
            });
        } else {
            executeCreate({
                data: mixinFuncs.prepareCreateData(values),
                onCompleted: mixinFuncs.onSaveCompleted,
                onError: (err) => mixinFuncs.onSaveError(err, callback),
            });
        }
    };

    const onSaveCompleted = (responseData) => {
        setSubmit(false);
        if (responseData?.data?.errors?.length) {
            mixinFuncs.onSaveError();
        } else {
            if (isEditing) {
                mixinFuncs.onUpdateCompleted(responseData);
            } else {
                mixinFuncs.onInsertCompleted(responseData);
            }
        }
    };

    const getActionName = () => {
        return isEditing ? 'Update' : 'Create';
    };

    const onUpdateCompleted = (responseData) => {
        if (responseData.result === true) {
            notification({
                message: intl.formatMessage(message.updateSuccess, {
                    objectName: options.objectName,
                }),
            });
            mixinFuncs.onBack(false);
        }
    };

    const onInsertCompleted = (responseData) => {
        if (responseData.result === true) {
            notification({
                message: intl.formatMessage(message.createSuccess, {
                    objectName: options.objectName,
                }),
            });
            mixinFuncs.onBack(false);
        }
    };

    const handleShowErrorMessage = (err) => {
        const { response } = err;
        const responseData = response?.data;

        if (responseData?.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
            responseData.data.forEach((item) => {
                if (item.message) {
                    showErrorMessage(item.message, translate);
                }
            });
            return;
        }

        if (responseData?.message) {
            showErrorMessage(responseData.message, translate);
            return;
        }

        if (err && err.message) {
            showErrorMessage(err.message, translate);
        } else {
            showErrorMessage(`${getActionName()} failed. Please try again!`, translate);
        }
    };

    const onSaveError = (err, callback) => {
        setSubmit(false);
        mixinFuncs.handleShowErrorMessage(err);

        if (typeof callback === 'function') {
            callback(err);
        }
    };

    const setIsChangedFormValues = (flag) => {
        if (flag !== isChanged) {
            setChange(flag);
        }
    };

    const showCloseFormConfirm = (customDisabledSubmitValue, hiddenSubmit) => {
        const disabledSubmit = customDisabledSubmitValue !== undefined ? customDisabledSubmitValue : !isChanged;

        if (!disabledSubmit) {
            confirmModal.confirm({
                title: intl.formatMessage(closeFormMessage.closeTitle, { objectName: options.objectName }),
                confirmText: intl.formatMessage(closeFormMessage.ok),
                cancelText: intl.formatMessage(closeFormMessage.cancel),
                onConfirm: () => {
                    onBack();
                },
            });
        } else {
            onBack();
        }
    };

    const renderActions = (customDisabledSubmitValue) => {
        const disabledSubmit = customDisabledSubmitValue !== undefined ? customDisabledSubmitValue : !isChanged;
        return (
            <Flex justify="end" gap={12}>
                <Button
                    type="outline"
                    key="cancel"
                    onClick={(e) => {
                        e.stopPropagation();
                        mixinFuncs.showCloseFormConfirm();
                    }}
                >
                    {intl.formatMessage(message.cancel)}
                </Button>
                <Button
                    key="submit"
                    type="submit"
                    form={mixinFuncs.getFormId()}
                    loading={isSubmitting}
                    disabled={disabledSubmit}
                >
                    {isEditing ? intl.formatMessage(message.update) : intl.formatMessage(message.create)}
                </Button>
            </Flex>
        );
    };

    const overrideHandler = () => {
        const centralizedHandler = {
            getDetail,
            handleFetchDetail,
            mappingData,
            handleGetDetailError,
            getFormId,
            renderActions,
            prepareCreateData,
            prepareUpdateData,
            onSaveCompleted,
            onUpdateCompleted,
            onInsertCompleted,
            onSaveError,
            onSave,
            executeGet,
            executeCreate,
            executeUpdate,
            setDetail,
            setEditing,
            handleShowErrorMessage,
            getActionName,
            onBack,
            showCloseFormConfirm,
        };

        override?.(centralizedHandler);

        return centralizedHandler;
    };

    const mixinFuncs = overrideHandler();

    useEffect(() => {
        if (params.id) {
            if (params.id === 'create') setEditing(false);
            else mixinFuncs.getDetail();
        }
    }, []);

    return {
        detail,
        mixinFuncs,
        loading: false,
        onSave: mixinFuncs.onSave,
        setIsChangedFormValues,
        isEditing,
        title,
        setEditing,
    };
};

export default useSaveBase;
