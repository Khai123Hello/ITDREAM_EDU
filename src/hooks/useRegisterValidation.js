import { defineMessages } from 'react-intl';
import { EMAIL_PATTERN, PHONE_PATTERN } from '@constants';
import useTranslate from '@hooks/useTranslate';

const messages = defineMessages({
    requiredUsername: 'Vui lòng nhập tên đăng nhập',
    requiredFullName: 'Vui lòng nhập họ và tên',
    requiredEmail: 'Vui lòng nhập email',
    requiredPassword: 'Vui lòng nhập mật khẩu',
    requiredPhone: 'Vui lòng nhập số điện thoại',
    errorPassword: 'Mật khẩu phải chứa ít nhất 6 ký tự!',
    errorPhone: 'Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số!',
    errorEmail: 'Email không đúng định dạng! Vui lòng kiểm tra lại.',
    errorUsernamePattern:
        'Tên đăng nhập phải từ 8-20 ký tự, không bắt đầu/kết thúc bằng ký tự đặc biệt và không chứa ký tự đặc biệt đứng liền nhau.',
});

export default function useRegisterValidation() {
    const translate = useTranslate();

    const getUsernameRules = () => [
        {
            required: true,
            message: translate.formatMessage(messages.requiredUsername),
        },
        {
            validator: (_, value) => {
                if (!value) return Promise.resolve();
                const regex = /^(?=.{8,20}$)[a-zA-Z0-9]+([a-zA-Z0-9_.-]*[a-zA-Z0-9]+)?$/;
                if (!regex.test(value)) {
                    return Promise.reject(translate.formatMessage(messages.errorUsernamePattern));
                }
                return Promise.resolve();
            },
        },
    ];

    const getFullNameRules = () => [
        {
            required: true,
            message: translate.formatMessage(messages.requiredFullName),
        },
    ];

    const getEmailRules = () => [
        {
            required: true,
            message: translate.formatMessage(messages.requiredEmail),
        },
        {
            pattern: new RegExp(EMAIL_PATTERN),
            message: translate.formatMessage(messages.errorEmail),
        },
    ];

    const getPasswordRules = () => [
        {
            required: true,
            message: translate.formatMessage(messages.requiredPassword),
        },
        {
            min: 6,
            message: translate.formatMessage(messages.errorPassword),
        },
    ];

    const getPhoneRules = () => [
        {
            required: true,
            message: translate.formatMessage(messages.requiredPhone),
        },
        {
            pattern: new RegExp(PHONE_PATTERN),
            message: translate.formatMessage(messages.errorPhone),
        },
    ];

    const validateEmail = (value) => {
        return new RegExp(EMAIL_PATTERN).test(value);
    };

    const validatePhone = (value) => {
        return new RegExp(PHONE_PATTERN).test(value);
    };

    const validatePassword = (value) => {
        return value && value.length >= 6;
    };

    const validateStrictUsername = (username) => {
        const regex = /^(?=.{8,20}$)[a-zA-Z0-9]+([a-zA-Z0-9_.-]*[a-zA-Z0-9]+)?$/;
        return regex.test(username);
    };

    return {
        getUsernameRules,
        getFullNameRules,
        getEmailRules,
        getPasswordRules,
        getPhoneRules,
        validateEmail,
        validatePhone,
        validatePassword,
        validateStrictUsername,
    };
}
