import React from 'react';
import Breadcrumb from '@components/common/elements/Breadcrumb';
import LoadingComponent from '@components/common/loading/LoadingComponent';
import classNames from 'classnames';

import styles from './PageWrapper.module.scss';

const PageWrapper = ({ loading, children, routes = [], tabs, onChangeTab, activeTab }) => {
    const hasTab = !!tabs?.length;
    const breadcrumbData = routes.map((route) => ({
        label: route.breadcrumbName || route.title,
        link: route.path,
    }));

    return (
        <div className={styles.pageWrapper}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
                    <LoadingComponent />
                </div>
            ) : (
                <>
                    <div className={classNames(styles.pageHeader, hasTab && styles.hasTab)}>
                        {!!routes?.length && <Breadcrumb data={breadcrumbData} />}
                    </div>
                    <div className={styles.pageContent}>{children}</div>
                </>
            )}
        </div>
    );
};

export default PageWrapper;
