const handleApiResponse = ({ success, responseData }, onCompleted, onError) =>
    success ? onCompleted(responseData) : onError(responseData);

const errorCodeHandle = (responseData) => {
    if (responseData.result === false && responseData.code) {
        const { code } = responseData;
        if (code === 'ERROR-ACCOUNT-000') return 'Thông tin đăng kí đã tồn tại !!!';
        return false;
    }
    return false;
};
export { errorCodeHandle, handleApiResponse };
