import React from 'react';
import { defineMessages } from 'react-intl';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { ReactComponent as IconEmpty } from '@assets/icons/iconEmpty.svg';
import useTranslate from '@hooks/useTranslate';
import routes from '@routes';

import styles from './index.module.scss';

const messages = defineMessages({
    noData: 'No data',
    createEmpty: 'Get started by adding your first item now',
    createNew: 'Add Cart',
});
const Empty = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const params = useParams();

    return (
        <div className={styles.empty}>
            <IconEmpty style={{ width: '120px', height: '120px' }} />{' '}
            <div className={styles.noData}>{translate.formatMessage(messages.noData)}</div>
            {/* <div className={styles.shortDescription}>{translate.formatMessage(messages.createEmpty)}</div> */}
            <div
                className={styles.btn}
                onClick={() => navigate(generatePath(routes.homePage.path, { restaurantId: params.restaurantId }))}
            >
                {translate.formatMessage(messages.createNew)}
            </div>
        </div>
    );
};
export default Empty;
