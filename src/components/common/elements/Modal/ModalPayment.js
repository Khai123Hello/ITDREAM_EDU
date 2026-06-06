import React from 'react';
import { defineMessages } from 'react-intl';
import { ReactComponent as IconClose } from '@assets/icons/closeModal.svg';
import useTranslate from '@hooks/useTranslate';
import useUncontrolled from '@hooks/useUncontrolled';
import * as Dialog from '@radix-ui/react-dialog';
import cls from 'classnames';

import Flex from '../Flex';

import styles from './Modal.module.scss';

const ModalPayment = ({
    trigger,
    onOpenChange,
    children,
    open,
    className,
    style,
    zIndex,
    maskClosable = true,
    handleOnCancel,
    title = '',
    onCancel,
    showHeader = true,
    clickOutsideToClose = false,
}) => {
    const [ _open, _onOpenChange ] = useUncontrolled({ value: open, onChange: onOpenChange });
    const translate = useTranslate();
    return (
        <Dialog.Root open={_open} onOpenChange={(value) => _onOpenChange?.(value)}>
            {trigger}
            <Dialog.Portal>
                <Dialog.Overlay
                    className={styles.overlay}
                    style={{
                        zIndex,
                    }}
                />
                <Dialog.Content
                    style={style}
                    tabIndex="none"
                    onInteractOutside={(e) => {
                        if (clickOutsideToClose) {
                            onCancel();
                            return;
                        }
                        if (!maskClosable) {
                            e.preventDefault();
                        }
                    }}
                    className={cls(styles.content, className)}
                >
                    <Flex justify="center" direction="column" style={{ height: '100%' }}>
                        {showHeader && (
                            <div className={styles.headerPayment}>
                                <div style={{ margin: 0, fontSize: '20px' }}>{title}</div>
                                <button
                                    onClick={onCancel}
                                    className={styles.closeButton}
                                    style={{
                                        fontSize: '25px',
                                        cursor: 'pointer',
                                        color: '#9295a5',
                                        position: 'absolute',
                                        top: '28px',
                                        right: '20px',
                                    }}
                                >
                                    <IconClose style={{ marginBottom: '10px' }} />
                                </button>
                            </div>
                        )}
                        {children}
                    </Flex>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

function Root({
    trigger,
    onOpenChange,
    onClose,
    children,
    open,
    className,
    classNames = {},
    style,
    zIndex,
    maskClosable = true,
    centered = true,
    width = '70rem',
    innerRef,
    loading = false,
}) {
    return (
        <Dialog.Root
            open={open}
            onOpenChange={(value) => {
                if (loading) return;

                onOpenChange?.(value);
                !value && onClose?.();
            }}
        >
            {trigger && <ModalPayment.Trigger>{trigger}</ModalPayment.Trigger>}
            <Dialog.Portal>
                <Dialog.Overlay className={styles.modalOverlay} />
                <Dialog.Content
                    ref={innerRef}
                    style={{ ...style, '--modal-width': width, zIndex }}
                    tabIndex="none"
                    className={cls(styles.modal, className, classNames.root)}
                    onMouseDown={() => {
                        if (loading) return;

                        if (maskClosable && open) {
                            onOpenChange?.(false);
                            onClose?.();
                        }
                    }}
                >
                    <div data-centered={centered} className={cls(styles.modalInner, classNames.inner)}>
                        <div
                            className={cls(styles.modalContent, classNames.content)}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {children}
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

const Trigger = ({ children }) => <Dialog.Trigger asChild>{children}</Dialog.Trigger>;

const Close = ({ children }) => <Dialog.Close asChild>{children}</Dialog.Close>;

function Header({ title, className, classNames = {}, children }) {
    return (
        <div className={cls(styles.modalHeader, className, classNames.header)}>
            {children || <div className={cls(styles.modalTitle, classNames.title)}>{title}</div>}
        </div>
    );
}

function Body({ children, className }) {
    return <div className={cls(styles.modalBody, className)}>{children}</div>;
}

function Footer({ children, className }) {
    return <div className={cls(styles.modalFooter, className)}>{children}</div>;
}

ModalPayment.Root = Root;
ModalPayment.Trigger = Trigger;
ModalPayment.Close = Close;
ModalPayment.Header = Header;
ModalPayment.Body = Body;
ModalPayment.Footer = Footer;

export default ModalPayment;
