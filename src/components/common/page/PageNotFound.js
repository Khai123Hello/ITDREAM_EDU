import React from 'react';
import notFoundImage from '@assets/images/bg_404.png';

import styles from './PageNotFound.module.scss';

const PageNotFound = () => {
    return (
        <div className={styles.pageNotFound}>
            <img alt="not-found-background" src={notFoundImage} />
        </div>
    );
};

export default PageNotFound;
