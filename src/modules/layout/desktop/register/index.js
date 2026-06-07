import React, { useEffect, useRef, useState } from 'react';
import { TbArrowRight, TbBolt, TbCheck, TbLogin, TbRocket } from 'react-icons/tb';
import { defineMessages } from 'react-intl';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@components/common/elements/Button';
import DatePickerField from '@components/common/elements/DatePicker/DatePickerField';
import { Form } from '@components/common/elements/Form';
import { InputField } from '@components/common/elements/Input';
import { PasswordField } from '@components/common/elements/PasswordInput';
import { DEFAULT_FORMAT } from '@constants';
import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@constants/intl';
import useFetch from '@hooks/useFetch';
import useRegisterValidation from '@hooks/useRegisterValidation';
import useTranslate from '@hooks/useTranslate';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import styles from './register.module.scss';

const message = defineMessages({
    titleHello: 'Welcome to {objectName}',
    placeholderUsername: 'Enter username',
    placeholderFullName: 'Enter full name',
    requiredUsername: 'Please enter your username',
    requiredFullName: 'Please enter your full name',
    requiredBirthday: 'Please enter your birthday',
    requiredEmail: 'Please enter your email',
    requiredPassword: 'Please enter your password',
    requiredPhone: 'Please enter your phone',
    errorPassword: 'Password must be at least 6 characters long!',
    errorPhone: 'Phone must be at 10 characters long!',
    errorEmail: 'Invalid email! Please enter a valid format.',
    policy: 'By signing up, I agree to our general terms and conditions.',
    description:
        'Click here if you want to receive updates from NailHPOS via email about current offers and beauty news. You can withdraw your consent at any time with future effect. To do this, click the link at the bottom of the respective email. More information can be found in our',
    policyLink: 'privacy policy',
    aboutUs: '.',
    enterEmail: 'Enter email',
});

function RegisterDesktop({ form }) {
    const translate = useTranslate();
    const navigate = useNavigate();
    const {
        getUsernameRules,
        getFullNameRules,
        getEmailRules,
        getPasswordRules,
        getPhoneRules,
    } = useRegisterValidation();

    const [ step, setStep ] = useState(1);
    const [ idHash, setIdHash ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ otp, setOtp ] = useState([ '', '', '', '', '', '' ]);
    const [ resendTimer, setResendTimer ] = useState(0);
    const [ redirectTimer, setRedirectTimer ] = useState(0);

    const otpRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];

    const { execute: executeRegister, loading: loadingRegister } = useFetch(apiConfig.student.register);
    const { execute: executeVerify, loading: loadingVerify } = useFetch(apiConfig.account.verify);
    const { execute: executeResend, loading: loadingResend } = useFetch(apiConfig.account.resendVerify);

    // Countdown for OTP resend timer
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [ resendTimer ]);

    // Countdown for login redirect
    useEffect(() => {
        let interval;
        if (step === 3 && redirectTimer > 0) {
            interval = setInterval(() => {
                setRedirectTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        navigate('/login');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [ step, redirectTimer, navigate ]);

    // Auto-focus first input when entering step 2
    useEffect(() => {
        if (step === 2) {
            setTimeout(() => {
                if (otpRefs[0]?.current) {
                    otpRefs[0].current.focus();
                }
            }, 100);
        }
    }, [ step ]);

    const handleRegisterSubmit = (values) => {
        const payload = {
            ...values,
            birthday: values.birthday ? dayjs(values.birthday).format(DEFAULT_FORMAT) : null,
        };

        executeRegister({
            data: payload,
            onCompleted: (res) => {
                if (res && res.result === false) {
                    const errMsg = res.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.';
                    toast.error(errMsg);
                    return;
                }
                const returnedIdHash = res?.data?.idHash;
                if (returnedIdHash) {
                    setIdHash(returnedIdHash);
                    setEmail(values.email);
                    setStep(2);
                    setResendTimer(60);
                    toast.success('Đăng ký thông tin thành công! Vui lòng kiểm tra mã xác thực OTP gửi qua email.');
                } else {
                    toast.error('Không tìm thấy idHash trong phản hồi từ hệ thống.');
                }
            },
            onError: (err) => {
                const errMsg = err?.response?.data?.message || err?.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.';
                toast.error(errMsg);
            },
        });
    };

    const handleVerifyOtp = () => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            toast.error('Vui lòng nhập đầy đủ mã xác thực gồm 6 chữ số.');
            return;
        }

        executeVerify({
            data: {
                idHash,
                otp: otpString,
            },
            onCompleted: (res) => {
                if (res && res.result === false) {
                    toast.error(res.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
                    return;
                }
                if (res?.result || res?.code === 'SUCCESS') {
                    setStep(3);
                    setRedirectTimer(10);
                    toast.success('Xác thực tài khoản thành công!');
                } else {
                    toast.error(res?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
                }
            },
            onError: (err) => {
                const errMsg = err?.response?.data?.message || err?.message || 'Xác thực không thành công. Vui lòng thử lại.';
                toast.error(errMsg);
            },
        });
    };

    const handleResendOtp = (e) => {
        if (e) e.preventDefault();
        if (resendTimer > 0 || loadingResend) return;

        executeResend({
            data: { email },
            onCompleted: (res) => {
                if (res && res.result === false) {
                    toast.error(res.message || 'Yêu cầu gửi lại mã thất bại.');
                    return;
                }
                const returnedIdHash = res?.data?.idHash;
                if (returnedIdHash) {
                    setIdHash(returnedIdHash);
                    setResendTimer(60);
                    setOtp([ '', '', '', '', '', '' ]);
                    setTimeout(() => {
                        if (otpRefs[0]?.current) {
                            otpRefs[0].current.focus();
                        }
                    }, 50);
                    toast.success('Mã OTP đã được gửi lại vào email.');
                } else {
                    toast.error('Yêu cầu gửi lại mã thất bại.');
                }
            },
            onError: (err) => {
                const errMsg = err?.response?.data?.message || err?.message || 'Gửi lại mã không thành công.';
                toast.error(errMsg);
            },
        });
    };

    const handleOtpChange = (e, index) => {
        const val = e.target.value.replace(/\D/g, '');
        const newOtp = [ ...otp ];
        newOtp[index] = val;
        setOtp(newOtp);

        if (val && index < 5) {
            otpRefs[index + 1].current.focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const pasteData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pasteData)) {
            const digits = pasteData.split('');
            setOtp(digits);
            setTimeout(() => {
                if (otpRefs[5]?.current) {
                    otpRefs[5].current.focus();
                }
            }, 50);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <TbBolt />
                    </div>
                    <span className={styles.logoName}>ITDream</span>
                </div>

                <div className={styles.card}>
                    <div className={styles.stepBar}>
                        <div
                            className={`${styles.stepTab} ${
                                step === 1 ? styles.active : step > 1 ? styles.done : styles.todo
                            }`}
                        >
                            <div className={styles.stepDot}>
                                {step > 1 ? <TbCheck style={{ fontSize: '14px' }} /> : '1'}
                            </div>
                            <span className={styles.stepLbl}>Đăng ký</span>
                        </div>
                        <div
                            className={`${styles.stepTab} ${
                                step === 2 ? styles.active : step > 2 ? styles.done : styles.todo
                            }`}
                        >
                            <div className={styles.stepDot}>
                                {step > 2 ? <TbCheck style={{ fontSize: '14px' }} /> : '2'}
                            </div>
                            <span className={styles.stepLbl}>Xác thực OTP</span>
                        </div>
                        <div className={`${styles.stepTab} ${step === 3 ? styles.active : styles.todo}`}>
                            <div className={styles.stepDot}>3</div>
                            <span className={styles.stepLbl}>Hoàn tất</span>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className={styles.body}>
                            <Form form={form} onFinish={handleRegisterSubmit}>
                                <div className={styles.row2}>
                                    <div className={styles.field}>
                                        <InputField
                                            name="username"
                                            label={translate.formatMessage(commonMessage.username)}
                                            placeholder={translate.formatMessage(message.placeholderUsername)}
                                            rules={getUsernameRules()}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <InputField
                                            name="fullName"
                                            label={translate.formatMessage(commonMessage.fullName)}
                                            placeholder={translate.formatMessage(message.placeholderFullName)}
                                            rules={getFullNameRules()}
                                        />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <InputField
                                        name="email"
                                        label={translate.formatMessage(commonMessage.email)}
                                        placeholder={translate.formatMessage(message.enterEmail)}
                                        type="email"
                                        required
                                        rules={getEmailRules()}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <PasswordField
                                        name="password"
                                        label={translate.formatMessage(commonMessage.password)}
                                        placeholder={translate.formatMessage(commonMessage.placeholderPassword)}
                                        rules={getPasswordRules()}
                                    />
                                </div>

                                <div className={styles.row2}>
                                    <div className={styles.field}>
                                        <InputField
                                            name="phone"
                                            required
                                            label={translate.formatMessage(commonMessage.phone)}
                                            placeholder={translate.formatMessage(commonMessage.placeholderPhone)}
                                            rules={getPhoneRules()}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <DatePickerField
                                            name="birthday"
                                            label={translate.formatMessage(commonMessage.birthday)}
                                            required
                                            requireMessage={translate.formatMessage(message.requiredBirthday)}
                                            placeholder="DD/MM/YYYY"
                                            format="DD/MM/YYYY"
                                            picker="date"
                                            showTime={false}
                                        />
                                    </div>
                                </div>

                                <div className={styles.description}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        id="customCheckbox"
                                        defaultChecked
                                    />
                                    <label htmlFor="customCheckbox" className={styles.customCheckbox}></label>
                                    <div className={styles.shortDescription}>
                                        {translate.formatMessage(message.description)}{' '}
                                        <span className={styles.security}>
                                            {translate.formatMessage(message.policyLink)}
                                        </span>{' '}
                                        {translate.formatMessage(message.aboutUs)}
                                    </div>
                                </div>

                                <Button loading={loadingRegister} className={styles.submitBtn} buttonType="submit">
                                    <TbArrowRight style={{ marginRight: '6px' }} />
                                    Tiếp tục
                                </Button>
                            </Form>
                            <div className={styles.footerNote}>
                                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.body}>
                            <div className={styles.otpTitle}>Xác thực tài khoản</div>
                            <div className={styles.otpDesc}>
                                Mã OTP đã gửi tới email <span>{email || 'email của bạn'}</span>. Vui lòng kiểm tra hộp
                                thư và nhập mã bên dưới.
                            </div>

                            <div className={styles.otpRow}>
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={otpRefs[idx]}
                                        type="text"
                                        maxLength={1}
                                        className={styles.otpInp}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e, idx)}
                                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                                        disabled={loadingVerify}
                                    />
                                ))}
                            </div>

                            <div className={styles.resend}>
                                Không nhận được mã?{' '}
                                {resendTimer > 0 ? (
                                    <span>
                                        Gửi lại <span className={styles.timerText}>({resendTimer}s)</span>
                                    </span>
                                ) : (
                                    <a
                                        href="#"
                                        onClick={handleResendOtp}
                                        className={loadingResend ? styles.disabled : ''}
                                    >
                                        Gửi lại
                                    </a>
                                )}
                            </div>

                            <Button
                                loading={loadingVerify}
                                onClick={handleVerifyOtp}
                                className={styles.submitBtn}
                                disabled={otp.join('').length < 6}
                            >
                                <TbCheck style={{ marginRight: '6px' }} />
                                Xác nhận OTP
                            </Button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.successBody}>
                            <div className={styles.successIcon}>
                                <TbRocket />
                            </div>
                            <h3 className={styles.successTitle}>Chào mừng đến với ITDream!</h3>
                            <p className={styles.successDesc}>
                                Tài khoản của bạn đã được tạo thành công.
                                <br />
                                Vui lòng đăng nhập để bắt đầu hành trình chinh phục kỹ năng IT.
                            </p>
                            <Button onClick={() => navigate('/login')} className={styles.successBtn}>
                                <TbLogin style={{ marginRight: '6px' }} />
                                Vào trang đăng nhập
                            </Button>
                            <div className={styles.redirectText}>
                                Tự động chuyển sang trang đăng nhập sau <span>{redirectTimer}s</span>...
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.footerCopyRight}>© 2026 HQTech</div>
            </div>
        </div>
    );
}

export default RegisterDesktop;
