import React from 'react';
import { useDropzone } from 'react-dropzone';
import { ReactComponent as IconImagePlaceholder } from '@assets/icons/gallery-add.svg';
import { AppConstants } from '@constants';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { getDownloadUrl } from '@utils';
import { set } from 'lodash';

import styles from './UploadAvatar.module.scss';
function UploadAvatar({ onChange, value, error, upload, setImageUrl, imageUrl, disabled }) {
    const translate = useTranslate();
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/png': [ '.png' ],
            'image/jpeg': [ '.jpeg' ],
            'image/jpg': [ '.jpg' ],
        },
        disabled: disabled,
        onDrop: (files) => {
            onChange(files[0]);
            executeUpFile({
                data: {
                    type: 'AVATAR',
                    file: files[0],
                },
                onCompleted: (response) => {
                    if (response.result === true) {
                        setImageUrl(response.data.filePath);
                    }
                },
                onError: (error) => {
                    // onError();
                },
            });
        },
    });

    const previewSrc = value
        ? typeof value === 'string'
            ? getDownloadUrl(value)
            : URL.createObjectURL(value)
        : null;

    return (
        <div {...getRootProps()} data-error={error} className={styles.uploadThumbnail}>
            <div className={styles.thumbnailWrapper}>
                {!value && (
                    <div className={styles.placeholder}>
                        <IconImagePlaceholder />
                        <div>Upload your photo</div>
                    </div>
                )}

                {!!value && (
                    <img
                        className={styles.thumbnailImg}
                        alt="thumbnail preview"
                        src={previewSrc}
                        onLoad={() => !!previewSrc && URL.revokeObjectURL(previewSrc)}
                    />
                )}
                <input {...getInputProps()} type="file" hidden />
            </div>
        </div>
    );
}

export default UploadAvatar;
