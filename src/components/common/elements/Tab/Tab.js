import React from 'react';
import cls from 'classnames';

import Flex from '../Flex';

import styles from './Tab.module.scss';
function Tab({ items = [], active, className, classNames = {}, onTabClick, ...props }) {
    return (
        <div {...props} className={cls(styles.root, className, classNames.root)}>
            <Flex asChild columnGap="1.6rem" className={cls(styles.list, classNames.list)}>
                <ul>
                    {items.map((item, index) => {
                        const { key, label } = item;
                        return (
                            <li
                                key={key || index}
                                data-active={key === active}
                                className={cls(styles.item, classNames.item)}
                                onClick={() => onTabClick(item, index)}
                            >
                                {label}
                            </li>
                        );
                    })}
                </ul>
            </Flex>
            {!!items[active]?.children && (
                <div className={cls(styles.content, styles.content)}>{items[active]?.children}</div>
            )}
        </div>
    );
}

export default Tab;
