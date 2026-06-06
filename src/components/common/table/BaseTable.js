import React from 'react';
import Pagination from '@components/common/elements/Pagination';
import Table from '@components/common/elements/Table';
import classNames from 'classnames';

import styles from './BaseTable.module.scss';

const BaseTable = ({
    dataSource = [],
    onChange,
    rowSelection,
    columns = [],
    loading,
    pagination,
    rowKey = 'id',
    ...props
}) => {
    const key = typeof rowKey === 'function' ? 'id' : rowKey;

    const handlePageChange = (newPage) => {
        onChange?.({ current: newPage });
    };

    return (
        <div className={classNames(styles.baseTableContainer, props.className)}>
            <Table
                data={dataSource}
                columns={columns.filter(Boolean)}
                isLoading={loading}
                rowKey={key}
                rowSelection={rowSelection}
                {...props}
            />
            {pagination && (
                <div style={{ marginTop: '16px' }}>
                    <Pagination
                        current={pagination.current}
                        total={pagination.total}
                        size={pagination.pageSize}
                        onChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default BaseTable;
