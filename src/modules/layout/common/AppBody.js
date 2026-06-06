import React from 'react';

import styles from './AppBody.module.scss';
const AppBody = ({ children }) => {
    return <main className={styles.main}>{children}</main>;
};

export default AppBody;
