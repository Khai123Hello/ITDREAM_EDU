import React from 'react';
import { ReactComponent as ArrowLeftIcon } from '@assets/icons/arrow-left.svg';
import { ReactComponent as ArrowRightIcon } from '@assets/icons/arrow-right.svg';
import classNames from 'classnames';

import styles from './Pagination.module.scss';

function Pagination({
    className,
    current = 0,
    total = 0,
    size = 10,
    onChange = (value) => {
        // console.log({ newPage: value });
    },
}) {
    const lastPage = Math.ceil(total / size);

    if (current >= lastPage) {
        current = lastPage;
    }

    if (current < 0) {
        current = 0;
    }

    const onChangePage = (value) => {
        if (value <= 0 || value > lastPage) {
            return;
        }
        onChange && onChange(value);
    };

    if (total <= size) {
        return <></>;
    }

    return (
        <div
            className={classNames({
                [styles.wrapper]: true,
                [className]: true,
            })}
        >
            <div
                className={styles.info}
            >{`Hiển thị trang ${current} - ${current == lastPage ? total : size * current} of ${total}`}</div>
            {total > 0 && (
                <div className={styles.paging}>
                    <div
                        onClick={() => {
                            onChangePage(current - 1);
                        }}
                        className={classNames({
                            [styles.item]: true,
                            [styles.disabled]: current === 0 || current === 1,
                        })}
                    >
                        <ArrowLeftIcon />
                    </div>

                    <div
                        onClick={() => {
                            onChangePage(current + 1);
                        }}
                        className={classNames({
                            [styles.item]: true,
                            [styles.disabled]: current === lastPage,
                        })}
                    >
                        <ArrowRightIcon />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Pagination;
