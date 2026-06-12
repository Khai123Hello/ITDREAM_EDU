import React, { useState } from 'react';
import { TbBolt, TbChartDots, TbCode, TbLogin, TbShieldLock } from 'react-icons/tb';
import { defineMessages } from 'react-intl';
import OtpInput from 'react-otp-input';
import Button from '@components/common/elements/Button';
import Flex from '@components/common/elements/Flex';
import { Form } from '@components/common/elements/Form';
import { InputField } from '@components/common/elements/Input';
import { PasswordField } from '@components/common/elements/PasswordInput';
import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@constants/intl';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';

import styles from './index.module.scss';

const message = defineMessages({
    confirmOTP: 'OTP Verification',
    setupAccount: 'Set up a new account in your authenticator app and scan the QR code below.',
    enterOTP: 'Enter OTP code',
    continue: 'Continue',
});

const GoogleIcon = () => (
    <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="#4285f4"
            d="M23.52 12.27c0-.86-.08-1.69-.22-2.49H12v4.7h6.46a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.58-5.15 3.58-8.83z"
        />
        <path
            fill="#34a853"
            d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3a7.22 7.22 0 0 1-10.75-3.8H1.33v3.1A12 12 0 0 0 12 24z"
        />
        <path fill="#fbbc05" d="M5.32 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.33a12 12 0 0 0 0 10.8l3.99-3.1z" />
        <path
            fill="#ea4335"
            d="M12 4.77c1.76 0 3.35.61 4.59 1.8l3.43-3.43A11.52 11.52 0 0 0 12 0 12 12 0 0 0 1.33 6.6l3.99 3.1A7.16 7.16 0 0 1 12 4.77z"
        />
    </svg>
);

const getCategoryInfo = (title, index) => {
    const lowerTitle = (title || '').toLowerCase();
    if (
        lowerTitle.includes('data') ||
        lowerTitle.includes('analyst') ||
        lowerTitle.includes('analytics') ||
        lowerTitle.includes('chart')
    ) {
        return { label: 'Data Analyst', icon: <TbChartDots /> };
    }
    if (
        lowerTitle.includes('security') ||
        lowerTitle.includes('pentest') ||
        lowerTitle.includes('audit') ||
        lowerTitle.includes('shield') ||
        lowerTitle.includes('hack')
    ) {
        return { label: 'Security', icon: <TbShieldLock /> };
    }
    if (index === 1) return { label: 'Data Analyst', icon: <TbChartDots /> };
    if (index === 2) return { label: 'Security', icon: <TbShieldLock /> };
    return { label: 'Developer', icon: <TbCode /> };
};

const formatParticipant = (num) => {
    if (!num) return '0';
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return num;
};

function LoginPageDesktop({
    onFinish,
    onFinishOTP,
    handleForgotPasswordClick,
    handleRegisterPage,
    loading,
    form,
    imgUrl,
    isOtp,
    fieldName = 'email',
    fieldLabel = 'E-mail',
}) {
    const [otp, setOtpLocal] = useState('');
    const translate = useTranslate();

    // Fetch simulations from simulation/guest_list
    const { data: simulations } = useFetch(apiConfig.simulation.guestList, {
        immediate: true,
        params: {
            pageNumber: 0,
            pageSize: 3,
            status: 1,
        },
        mappingData: (response) => response?.data?.content || [],
    });

    const displaySimulations = simulations || [];

    const handleSubmit = () => {
        onFinishOTP(otp);
    };

    return (
        <div className={styles.loginPage}>
            {!isOtp ? (
                <div className={styles.card}>
                    <div className={styles.left}>
                        <div>
                            <div className={styles.logo}>
                                <div className={styles.logoIcon}>
                                    <TbBolt />
                                </div>
                                <span className={styles.logoName}>ITDream</span>
                            </div>

                            <div className={styles.greetingHi}>Chào mừng trở lại 👋</div>
                            <div className={styles.greetingSub}>
                                Hôm nay là một ngày mới — tiếp tục hành trình IT của bạn.
                                <br />
                                Đăng nhập để trải nghiệm các bài mô phỏng.
                            </div>

                            <Form className={styles.form} form={form} onFinish={onFinish}>
                                <div className={styles.field}>
                                    <InputField
                                        name={fieldName}
                                        required
                                        label={fieldLabel}
                                        placeholder="example@gmail.com"
                                    />
                                </div>
                                <div className={styles.field}>
                                    <PasswordField
                                        name="password"
                                        label={translate.formatMessage(commonMessage.password)}
                                        required
                                        placeholder={translate.formatMessage(commonMessage.placeholderPassword)}
                                    />
                                </div>

                                <div className={styles.forgotPassword} onClick={handleForgotPasswordClick}>
                                    Quên mật khẩu?
                                </div>

                                <Button
                                    loading={loading}
                                    className={styles.btnMain}
                                    buttonType="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className={styles.spinner} />
                                            <span>Đang đăng nhập...</span>
                                        </>
                                    ) : (
                                        <>
                                            <TbLogin style={{ fontSize: '16px' }} />
                                            <span>Đăng Nhập</span>
                                        </>
                                    )}
                                </Button>

                                <div className={styles.socialDivider}>
                                    <span>Hoặc</span>
                                </div>

                                <Button className={styles.googleButton} type="none" buttonType="button">
                                    <GoogleIcon />
                                    <span>Tiếp tục với Google</span>
                                </Button>
                            </Form>

                            <div className={styles.registerRow}>
                                Chưa có tài khoản? <a onClick={handleRegisterPage}>Đăng ký ngay</a>
                            </div>
                        </div>

                        <div className={styles.copyright}>© 2026 ITDream — Nền tảng mô phỏng ngành nghề IT</div>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.rightLogo}>
                            <div className={styles.rightLogoIcon}>
                                <TbBolt />
                            </div>
                            <span className={styles.rightLogoName}>ITDream</span>
                        </div>
                        <div className={styles.rightDesc}>
                            Trải nghiệm thực tế tại các công ty công nghệ hàng đầu Việt Nam.
                        </div>
                        <div className={styles.rightDivider} />

                        {displaySimulations.length > 0 ? (
                            displaySimulations.slice(0, 3).map((item, index) => {
                                const cat = getCategoryInfo(item.title, index);
                                const orgName = item.educator?.organization?.name;
                                const titleText = orgName ? `${item.title} — ${orgName}` : item.title;
                                return (
                                    <div key={item.id || index} className={styles.rightTag}>
                                        <div className={styles.tl}>
                                            {cat.icon} {cat.label}
                                        </div>
                                        <div className={styles.tv}>{titleText}</div>
                                        <div className={styles.ts}>
                                            Đang mở · {formatParticipant(item.totalParticipant)} lượt làm
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.rightInfoBlock}>
                                <div className={styles.rightInfoTitle}>💡 Học qua trải nghiệm</div>
                                <div className={styles.rightInfoText}>
                                    Thực hành các dự án mô phỏng thực tế từ doanh nghiệp. Rèn luyện kỹ năng chuyên môn,
                                    quy trình làm việc thực tế và sẵn sàng cho sự nghiệp IT.
                                </div>
                            </div>
                        )}

                        <div className={styles.rightDivider} />
                        <div className={styles.rightMotto}>Thực học · Thực hành · Thực nghiệp</div>
                    </div>
                </div>
            ) : (
                <div className={styles.confirmOTP}>
                    <h3 className={styles.titleOTP}>{translate.formatMessage(message.confirmOTP)}</h3>
                    {imgUrl != null ? (
                        <div className={styles.qrUrl}>
                            <span className={styles.note}>{translate.formatMessage(message.setupAccount)}</span>
                            <img src={imgUrl} alt="OTP QR Code" />
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
                            <Button loading={loading} className={styles.btn} buttonType="submit">
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
