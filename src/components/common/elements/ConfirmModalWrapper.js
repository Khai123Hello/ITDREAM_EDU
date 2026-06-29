import React, { useState } from 'react';
import createCtx from '@utils/create-ctx';

import ConfirmModal from './Modal/ConfirmModal';

export const [ConfirmModalProvider, useConfirmModal] = createCtx('ConfirmModal');

const ConfirmModalWrapper = ({ children }) => {
    const [open, setModalVisible] = useState(false);
    const [modalProps, setModalProps] = useState({});
    const showModal = (props) => {
        setModalProps(props);
        setModalVisible(true);
    };

    const hideModal = () => {
        modalProps?.onCancel?.();
        setModalVisible(false);
    };

    return (
        <ConfirmModalProvider confirm={showModal}>
            {children}
            <ConfirmModal
                open={open}
                {...modalProps}
                onOpenChange={(value) => {
                    setModalVisible(value);
                    modalProps?.onOpenChange && modalProps?.onOpenChange();
                }}
                onCancel={hideModal}
                onConfirm={() => {
                    modalProps?.onConfirm();
                    hideModal();
                }}
            />
        </ConfirmModalProvider>
    );
};

export default ConfirmModalWrapper;
