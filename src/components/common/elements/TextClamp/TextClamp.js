import React from 'react';
import classNames from 'classnames';

import styles from './TextClamp.module.scss';

function TextClamp({ children, lineClamp = 2, fontSize, height, overFlowType, lineHeight, className, ...props }) {
    const style = {
        '--display': lineClamp > 1 ? '-webkit-box' : 'block',
        '--white-space': lineClamp > 1 ? 'normal' : 'nowrap',
        '--line-clamp': lineClamp,
        '--font-size': fontSize,
        '--overflow-type': overFlowType,
        '--line-height': !fontSize ? 'normal' : !lineHeight ? `calc(var(--font-size) * 1.3)` : lineHeight,
        '--height': !fontSize ? 'auto' : !height ? `calc(var(--line-height) * var(--line-clamp))` : height,
    };

    return (
        <div
            {...props}
            style={{
                ...style,
                ...props.style,
            }}
            className={classNames(styles.text, className)}
        >
            {children}
        </div>
    );
}

export default TextClamp;
