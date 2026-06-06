import React, { useState } from 'react';
import { defineMessages } from 'react-intl';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import RenderContext from '@components/common/elements/RenderContext';
import apiConfig from '@constants/apiConfig';
import { errorCodes } from '@constants/ErrorCode';
import useFetch from '@hooks/useFetch';
import useNotification from '@hooks/useNotification';
import useTranslate from '@hooks/useTranslate';
import RegisterDesktop from '@modules/layout/desktop/register';
import routes from '@routes';
import { showErrorMessage } from '@services/notifyService';
import { useForm } from 'rc-field-form';
import { toast } from 'sonner';

const messages = defineMessages({
    registrationSuccess: 'Account registration successfully',
    registrationFail: 'Error register',
});
const RegisterContainer = ({ title }) => {
    const [ form ] = useForm();

    const translate = useTranslate();
    const navigate = useNavigate();
    const params = useParams();
    const notification = useNotification();
    const { execute: executeRegister, loading: loadingRegister } = useFetch({
        ...apiConfig.user.register,
    });

    const onFinish = (values) => {
        const loginData = {
            ...values,
        };
        executeRegister({
            data: loginData,
            onCompleted: (res) => {
                navigate(
                    generatePath(`${routes.loginPage.path}`, {
                        restaurantId: params.restaurantId,
                    }),
                );
                toast.success(translate.formatMessage(messages.registrationSuccess));
            },
            onError: (err) => {
                const errorCode = err?.response?.data?.code;

                const errorMessage = errorCodes[errorCode]?.message;
                if (errorMessage) {
                    showErrorMessage(translate.formatMessage(errorMessage), translate);
                } else {
                    showErrorMessage(translate.formatMessage(messages.registrationFail));
                }
            },
        });
    };

    const layout = {
        defaultTheme: (props) => <RegisterDesktop form={form} onFinish={onFinish} loading={loadingRegister} />,
    };

    return (
        <RenderContext
            components={{
                desktop: {
                    defaultTheme: RegisterDesktop,
                },
            }}
            layout={layout}
        />
    );
};

export default RegisterContainer;
