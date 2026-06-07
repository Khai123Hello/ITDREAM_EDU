import React from 'react';
import { defineMessages } from 'react-intl';
import Button from '@components/common/elements/Button';
import DatePickerField from '@components/common/elements/DatePicker/DatePickerField';
import Flex from '@components/common/elements/Flex';
import { Form } from '@components/common/elements/Form';
import { InputField } from '@components/common/elements/Input';
import { PasswordField } from '@components/common/elements/PasswordInput';
import { commonMessage } from '@constants/intl';
import useTranslate from '@hooks/useTranslate';
import { Buffer } from 'buffer';

import styles from './register.module.scss';

window.Buffer = window.Buffer || Buffer;

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

function RegisterDesktop({ onFinish, form, loading }) {
    const translate = useTranslate();

    return (
        <div className={styles.loginPage}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <div className={styles.loginForm}>
                        <Form className={styles.form} form={form} onFinish={onFinish}>
                            <Flex rowGap="24px" className={styles.flex}>
                                <InputField
                                    className={styles.input}
                                    name="username"
                                    label={translate.formatMessage(commonMessage.username)}
                                    placeholder={translate.formatMessage(message.placeholderUsername)}
                                    rules={[
                                        {
                                            required: true,
                                            message: translate.formatMessage(message.requiredUsername),
                                        },
                                    ]}
                                />
                                <InputField
                                    className={styles.input}
                                    name="fullName"
                                    label={translate.formatMessage(commonMessage.fullName)}
                                    placeholder={translate.formatMessage(message.placeholderFullName)}
                                    rules={[
                                        {
                                            required: true,
                                            message: translate.formatMessage(message.requiredFullName),
                                        },
                                    ]}
                                />
                            </Flex>
                            <Flex rowGap="24px">
                                <InputField
                                    className={styles.input}
                                    name="email"
                                    label={translate.formatMessage(commonMessage.email)}
                                    placeholder={translate.formatMessage(message.enterEmail)}
                                    type="email"
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: translate.formatMessage(message.requiredEmail),
                                        },
                                        {
                                            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                            message: translate.formatMessage(message.errorEmail),
                                        },
                                    ]}
                                />
                                <PasswordField
                                    className={styles.input}
                                    name="password"
                                    label={translate.formatMessage(commonMessage.password)}
                                    placeholder={translate.formatMessage(commonMessage.placeholderPassword)}
                                    rules={[
                                        { required: true, message: translate.formatMessage(message.requiredPassword) },
                                        {
                                            min: 6,
                                            message: translate.formatMessage(message.errorPassword),
                                        },
                                    ]}
                                />
                            </Flex>
                            <Flex rowGap="24px" className={styles.flexPhone}>
                                <InputField
                                    className={styles.input}
                                    name="phone"
                                    required
                                    label={translate.formatMessage(commonMessage.phone)}
                                    placeholder={translate.formatMessage(commonMessage.placeholderPhone)}
                                    rules={[
                                        { required: true, message: translate.formatMessage(message.requiredPhone) },
                                        {
                                            min: 10,
                                            message: translate.formatMessage(message.errorPhone),
                                        },
                                    ]}
                                />
                                <DatePickerField
                                    className={styles.input}
                                    name="birthday"
                                    label={translate.formatMessage(commonMessage.birthday)}
                                    required
                                    requireMessage={translate.formatMessage(message.requiredBirthday)}
                                    placeholder="DD/MM/YYYY"
                                    format="DD/MM/YYYY"
                                    picker="date"
                                    showTime={false}
                                />
                            </Flex>

                            <div className={styles.description}>
                                <input type="checkbox" className={styles.checkbox} id="customCheckbox" />
                                <label htmlFor="customCheckbox" className={styles.customCheckbox}></label>
                                <div className={styles.shortDescription}>
                                    {translate.formatMessage(message.description)}{' '}
                                    <span className={styles.security}>
                                        {translate.formatMessage(message.policyLink)}
                                    </span>{' '}
                                    {translate.formatMessage(message.aboutUs)}
                                </div>
                            </div>
                            <div className={styles.footer}>
                                <span className={styles.answer}>{translate.formatMessage(message.policy)}</span>
                                <Button loading={loading} className={styles.btn} buttonType="submit">
                                    {translate.formatMessage(commonMessage.register)}
                                </Button>
                            </div>
                        </Form>
                    </div>
                    <div className={styles.footerCopyRight}>© 2025 HQTech</div>
                </div>
            </div>
        </div>
    );
}

export default RegisterDesktop;
