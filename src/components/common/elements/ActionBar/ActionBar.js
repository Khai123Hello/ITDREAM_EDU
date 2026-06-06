//import { Button, Col, Modal, Row } from 'antd';
import React from 'react';
import { FaRegTrashCan } from 'react-icons/fa6';
//import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { FiPlus } from 'react-icons/fi';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import Button from '@components/common/elements/Button';
import Modal from '@components/common/elements/Modal';
import useDevices from '@hooks/useDevices';

import HasPermission from '../HasPermission';

import styles from './ActionBar.module.scss';
//import HasPermission from './HasPermission';

const message = defineMessages({
    create: {
        id: 'components.common.elements.actionBar.create',
        defaultMessage: 'Thêm mới',
    },
    bulkDelete: {
        title: {
            id: 'components.common.elements.actionBar.bulkDelete.title',
            defaultMessage: 'Are you sure you want to delete selected {objectName}?',
        },
        okText: {
            id: 'components.common.elements.actionBar.bulkDelete.okText',
            defaultMessage: 'Yes',
        },
        noText: {
            id: 'components.common.elements.actionBar.bulkDelete.noText',
            defaultMessage: 'No',
        },
    },
});

function ActionBar({
    createLink,
    createPermission,
    selectedRows = [],
    onBulkDelete,
    objectName,
    location,
    type,
    style,
}) {
    const intl = useIntl();
    const { isMobile } = useDevices();
    //const LayoutRender = (isMobile ? layouts?.mobile?.defaultTheme : layouts?.desktop?.defaultTheme) || <div></div>;
    const onBulkDeleteButtonClick = () => {
        Modal.confirm({
            title: intl.formatMessage(message.bulkDelete.title, { objectName }),
            centered: true,
            okText: intl.formatMessage(message.bulkDelete.okText),
            okType: 'danger',
            cancelText: intl.formatMessage(message.bulkDelete.noText),
            onOk: () => {
                onBulkDelete();
            },
        });
    };

    return (
        <div className={styles.actionBar}>
            <div className={styles.left}>
                {selectedRows.length > 0 && (
                    <HasPermission>
                        <Button icon={<FaRegTrashCan />} onClick={onBulkDeleteButtonClick}>
                            Delete selected ({selectedRows.length})
                        </Button>
                    </HasPermission>
                )}
            </div>
            <div className={styles.right}>
                <Link to={createLink} state={{ action: 'create', prevPath: location.pathname }}>
                    <HasPermission requiredPermissions={[ createPermission ]}>
                        <Button className={isMobile ? `${styles.hamburger}` : ''} type="primary" style={style}>
                            <FiPlus /> {intl.formatMessage(message.create, { objectName })}
                        </Button>
                    </HasPermission>
                </Link>
            </div>
        </div>
    );
}

export default ActionBar;
