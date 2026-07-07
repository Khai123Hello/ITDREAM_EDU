import React, { useEffect } from 'react';
import AntdImgCrop from 'antd-img-crop';

function CropImageLink({ url, onCompleted, onError, aspect, onModalCancel, show }) {
    return (
        <AntdImgCrop aspect={aspect} onModalCancel={onModalCancel}>
            <Component show={show} url={url} onError={onError} onFinish={onCompleted} />
        </AntdImgCrop>
    );
}

function Component({ onFinish, url, show, beforeUpload, onError }) {
    useEffect(async () => {
        if (!show) return;
        try {
            let blob = await fetch(url).then((r) => r.blob());
            const file = await beforeUpload(blob, []);
            onFinish?.(file);
        } catch (error) {
            onError?.();
        }
    }, [url, show]);

    return <></>;
}

export default CropImageLink;
