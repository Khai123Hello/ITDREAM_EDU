import React from 'react';
import { useNavigate } from 'react-router-dom';
import RenderContext from '@components/common/elements/RenderContext';
import useAppLogin from '@hooks/useAppLogin';
import LoginPageDesktop from '@modules/layout/desktop/login';
import { GoogleOAuthProvider } from '@react-oauth/google';
import useForm from 'rc-field-form/lib/useForm';

const LoginPageContainer = () => {
    const navigate = useNavigate();
    const [ form ] = useForm();
    const { loading, handleLogin, handleGoogleLogin } = useAppLogin('student');

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
                onGoogleLogin={handleGoogleLogin}
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
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
            <RenderContext
                components={{
                    desktop: {
                        defaultTheme: LoginPageDesktop,
                    },
                }}
                layout={layout}
            />
        </GoogleOAuthProvider>
    );
};

export default LoginPageContainer;
