import { toast } from 'sonner';

const showSucsessMessage = (content, translate) => {
    toast.success('thành công');
};

const showErrorMessage = (message = 'Đã xảy ra lỗi', translate) => {
    const errorMessage = translate?.t ? translate.t(`${translate.ns}:error`, { defaultValue: message }) : message;

    toast.error(errorMessage);
};

const showWarningMessage = (content, translate) => {
    toast.error('cảnh báo');
};

export { showErrorMessage, showSucsessMessage, showWarningMessage };
