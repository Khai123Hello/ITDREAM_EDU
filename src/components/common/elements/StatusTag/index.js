import React from 'react';
import {
    MONTHLY_PERIOD_STATE_CALCULATED,
    MONTHLY_PERIOD_STATE_DONE,
    MONTHLY_PERIOD_STATE_PENDING,
    STATUS_ACTIVE,
    STATUS_LOCK,
    STATUS_PENDING,
} from '@constants';
import { statusOptions } from '@constants/masterData';
import classNames from 'classnames';

import styles from './index.module.scss';

const StatusTag = ({ status, children }) => {
    const color = {
        [STATUS_ACTIVE]: styles.active,
        [STATUS_PENDING]: styles.incoming,
        [STATUS_LOCK]: styles.lock,
    }[status];

    return <div className={classNames(styles.statusItem, color)}>{children}</div>;
};

export default StatusTag;
