import React from 'react';
import classNames from 'classnames';

import styles from './index.module.scss';

const Tag = ({
    color,
    backgroundColor,
    borderColor,
    borderRadius,
    fontSize,
    width = 'max-content',
    style,
    children,
}) => {
    const tinycolor = require('tinycolor2');
    const green = tinycolor(color);
    const lighterColor = green.lighten(45).toHexString();

    return (
        <div
            style={{
                ...style,
                color: color,
                border: borderColor ? borderColor : `1px solid ${lighterColor}`,
                backgroundColor: backgroundColor || lighterColor,
                width: width,
                borderRadius: borderRadius,
                fontSize: fontSize,
            }}
            className={styles.item}
        >
            {children}
        </div>
    );
};

export default Tag;
