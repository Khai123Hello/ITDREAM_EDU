import React from 'react';
import { useNavigate } from 'react-router-dom';
import RenderContext from '@components/common/elements/RenderContext';
import useAppLogin from '@hooks/useAppLogin';
import LoginPageDesktop from '@modules/layout/desktop/login';
import useForm from 'rc-field-form/lib/useForm';

const LoginPageContainer = () => {
    const navigate = useNavigate();
    const [ form ] = useForm();
    const { loading, handleLogin } = useAppLogin('student');

    const handleForgotPasswordClick = () => {
        navigate('/change-password');
    };

    const handleRegisterPage = () => {
        navigate('/register');
    };

    const layout = {
        defaultTheme: () => (
            <LoginPageDesktop
                onFinish={handleLogin}
                handleForgotPasswordClick={handleForgotPasswordClick}
                handleRegisterPage={handleRegisterPage}
                form={form}
                loading={loading}
                fieldName="email"
                fieldLabel="E-mail"
                showRoleSelector={false}
            />
        ),
    };

    return (
        <RenderContext
            components={{
                desktop: {
                    defaultTheme: LoginPageDesktop,
                },
            }}
            layout={layout}
        />
    );
};

export default LoginPageContainer;
