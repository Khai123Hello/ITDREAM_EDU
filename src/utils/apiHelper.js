const handleApiResponse = (result, onCompleted, onError) => {
    const { data: responseData } = result;
    if (responseData && responseData.result) onCompleted(responseData);
    else onError(responseData);
};

export { handleApiResponse };
