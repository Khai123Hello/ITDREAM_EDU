import React, { useState } from 'react';
import { defineMessages } from 'react-intl';
import OtpInput from 'react-otp-input';
import avatar from '@assets/icons/avatar.svg';
import facebook from '@assets/images/facebook.png';
import google from '@assets/images/google.png';
import imageLogin from '@assets/images/imageLogin.png';
import line from '@assets/images/line.png';
import Button from '@components/common/elements/Button';
import Flex from '@components/common/elements/Flex';
import { Form } from '@components/common/elements/Form';
import { InputField } from '@components/common/elements/Input';
import { PasswordField } from '@components/common/elements/PasswordInput';
import { AppConstants } from '@constants';
import { commonMessage } from '@constants/intl';
import useTranslate from '@hooks/useTranslate';
import { Buffer } from 'buffer';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import './index.scss';
import styles from './index.module.scss';
window.Buffer = window.Buffer || Buffer;

const message = defineMessages({
    titleComeback: 'Welcome back',
    title: 'Today is a new day. It’s your day.',
    titleLogin: 'Log in to start experiencing our services.',
    register: 'Don’t have an account?',
    confirmOTP: 'OTP Verification',
    setupAccount: 'Set up a new account in your authenticator app and scan the QR code below.',
    enterOTP: 'Enter OTP code',
    continue: 'Continue',
});

function LoginPageDesktop({
    onFinish,
    onFinishOTP,
    handleForgotPasswordClick,
    handleRegisterPage,
    loading,
    loadingVerifyCredential,
    form,
    imgUrl,
    isOtp,
    loadingApp,
    restaurantData,
    loginSlidesShow,
    fieldName = 'email',
    fieldLabel = 'E-mail',
}) {
    const [ otp, setOtpLocal ] = useState('');
    const translate = useTranslate();

    const handleSubmit = () => {
        onFinishOTP(otp);
    };

    return (
        <div className={styles.loginPage}>
            {!isOtp ? (
                <div className={styles.container}>
                    <div className={styles.left}>
                        <div className={styles.loginForm}>
                            <div className={styles.headerForm}>
                                <img
                                    alt="logo"
                                    className={styles.logo}
                                    src={
                                        restaurantData?.logoPath
                                            ? AppConstants.contentRootUrl + restaurantData?.logoPath
                                            : avatar
                                    }
                                />
                                <div className={styles.customTitle}>
                                    {translate.formatMessage(message.titleComeback)} 👋
                                </div>
                                <div className={styles.description}>
                                    {translate.formatMessage(message.title)}
                                    <div className={styles.shortDescription}>
                                        {translate.formatMessage(message.titleLogin)}
                                    </div>
                                </div>
                            </div>
                            <Form className={styles.form} form={form} onFinish={onFinish}>
                                <Flex direction="column" rowGap="24px">
                                    <InputField
                                        className={styles.input}
                                        name={fieldName}
                                        required
                                        label={fieldLabel}
                                        placeholder="Example@gmail.com"
                                    />
                                    <PasswordField
                                        name="password"
                                        label={translate.formatMessage(commonMessage.password)}
                                        required
                                        placeholder={translate.formatMessage(commonMessage.placeholderPassword)}
                                        className={styles.passwordInput}
                                    />
                                </Flex>

                                <div className={styles.forgotPassword} onClick={handleForgotPasswordClick}>
                                    {translate.formatMessage(commonMessage.forgetPassword)} ?
                                </div>
                                <Button
                                    loading={loadingVerifyCredential || loading || loadingApp}
                                    className={styles.btn}
                                    buttonType="submit"
                                >
                                    {translate.formatMessage(commonMessage.login)}
                                </Button>
                                <div className={styles.footer}>
                                    <div className={styles.question}>{translate.formatMessage(message.register)}</div>
                                    <div className={styles.register} onClick={handleRegisterPage}>
                                        {translate.formatMessage(commonMessage.register)}
                                    </div>
                                </div>
                            </Form>
                        </div>
                        <div className={styles.footerCopyRight}>© 2025 HQTech</div>
                    </div>
                    <div className={`${styles.contentRight} wrapper-login`}>
                        <Swiper spaceBetween={30} pagination={{ clickable: true }} modules={[ Pagination ]}>
                            {loginSlidesShow?.length > 0 ? (
                                loginSlidesShow?.map((slide, index) => (
                                    <SwiperSlide key={index}>
                                        <div style={{ position: 'relative' }}>
                                            <img
                                                src={`${AppConstants.contentRootUrl}${slide.imageUrl}`}
                                                alt={slide.title || `Slide ${index + 1}`}
                                                className={styles.imageLogin}
                                                onClick={() => slide.url && window.open(slide.url, '_blank')}
                                                style={{ cursor: slide.url ? 'pointer' : 'default' }}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))
                            ) : (
                                <SwiperSlide>
                                    <div style={{ position: 'relative' }}>
                                        <img src={imageLogin} alt="Default Login Image" className={styles.imageLogin} />
                                    </div>
                                </SwiperSlide>
                            )}
                        </Swiper>
                        <div className={styles.paginationWrapper} />
                    </div>
                </div>
            ) : (
                <div className={styles.confirmOTP}>
                    <h3 className={styles.titleOTP}>{translate.formatMessage(message.confirmOTP)}</h3>
                    {imgUrl != null ? (
                        <div className={styles.qrUrl}>
                            <span className={styles.note}>{translate.formatMessage(message.setupAccount)}</span>
                            <img src={imgUrl} />
                        </div>
                    ) : (
                        <div>
                            <span className={styles.note}>{translate.formatMessage(message.enterOTP)}</span>
                        </div>
                    )}
                    <Form onFinish={handleSubmit}>
                        <div className={styles.otpContainer}>
                            <OtpInput
                                value={otp}
                                onChange={setOtpLocal}
                                numInputs={6}
                                inputType="number"
                                inputStyle={styles.otpInput}
                                renderInput={(props) => <input {...props} />}
                            />
                        </div>
                        <Flex gap={15}>
                            <Button
                                loading={loadingVerifyCredential || loading || loadingApp}
                                className={styles.btn}
                                buttonType="submit"
                            >
                                {translate.formatMessage(message.continue)}
                            </Button>
                        </Flex>
                    </Form>
                </div>
            )}
        </div>
    );
}

export default LoginPageDesktop;
