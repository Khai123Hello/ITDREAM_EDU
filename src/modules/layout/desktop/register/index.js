import React from 'react';
import { defineMessages } from 'react-intl';
import Button from '@components/common/elements/Button';
import Flex from '@components/common/elements/Flex';
import { Form } from '@components/common/elements/Form';
import { InputField } from '@components/common/elements/Input';
import { commonMessage } from '@constants/intl';
import useTranslate from '@hooks/useTranslate';
import { Buffer } from 'buffer';

import styles from './register.module.scss';

window.Buffer = window.Buffer || Buffer;

const message = defineMessages({
    titleHello: 'Welcome to {objectName}',
    placeholderFirstName: 'Enter first name',
    placeholderLastName: 'Enter last name',
    requiredFirstName: 'Please enter your first name',
    requiredLastName: 'Please enter your last name',
    requiredGender: 'Please select a gender',
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
                                    name="firstName"
                                    label={translate.formatMessage(commonMessage.firstName)}
                                    placeholder={translate.formatMessage(message.placeholderFirstName)}
                                    rules={[
                                        {
                                            required: true,
                                            message: translate.formatMessage(message.requiredFirstName),
                                        },
                                    ]}
                                />
                                <InputField
                                    className={styles.input}
                                    name="lastName"
                                    label={translate.formatMessage(commonMessage.lastName)}
                                    placeholder={translate.formatMessage(message.placeholderLastName)}
                                    rules={[
                                        {
                                            required: true,
                                            message: translate.formatMessage(message.requiredLastName),
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
                                <InputField
                                    className={styles.input}
                                    name="password"
                                    type="password"
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
                                <div className={styles.sex}>
                                    <div>
                                        <span className={styles.label}>
                                            {translate.formatMessage(commonMessage.gender)}
                                        </span>
                                        <Form.Item
                                            name="gender"
                                            label={translate.formatMessage(commonMessage.gender)}
                                            initialValue="1"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: translate.formatMessage(message.requiredGender),
                                                },
                                            ]}
                                        >
                                            <div className={styles.sexInput}>
                                                <div className={styles.radio}>
                                                    <input
                                                        type="radio"
                                                        id="female"
                                                        name="gender"
                                                        value="1"
                                                        defaultChecked
                                                        className={styles.radioInput}
                                                    />
                                                    <label className={styles.customRadioLabel} htmlFor="female">
                                                        {translate.formatMessage(commonMessage.female)}
                                                    </label>
                                                </div>
                                                <div className={styles.radio}>
                                                    <input
                                                        type="radio"
                                                        id="male"
                                                        name="gender"
                                                        value="0"
                                                        className={styles.radioInput}
                                                    />
                                                    <label className={styles.customRadioLabel} htmlFor="male">
                                                        {translate.formatMessage(commonMessage.male)}
                                                    </label>
                                                </div>
                                            </div>
                                        </Form.Item>
                                    </div>
                                </div>
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
