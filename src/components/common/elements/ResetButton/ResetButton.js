import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ReactComponent as RefreshIcon } from '@assets/icons/refresh.svg';

import styles from './ResetButton.module.scss';

function ResetButton({ onClick = () => {} }) {
    return (
        <div onClick={onClick} className={styles.wrapper}>
            <RefreshIcon />
            <span>
                <FormattedMessage
                    defaultMessage="Đặt lại bộ lọc"
                    description=""
                    id="components.Common.ResetButton.ResetButton.reset"
                />
            </span>
        </div>
    );
}

export default ResetButton;
