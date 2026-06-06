import React, { forwardRef } from 'react';
import classNames from 'classnames';

import styles from './Flex.module.scss';

const Flex = forwardRef(
    (
        {
            className,
            gap,
            rowGap,
            columnGap,
            align,
            justify,
            wrap,
            direction,
            children,
            asChild = false,
            style,
            fullWidth = false,
            ...props
        },
        ref, // Nhận ref từ component cha
    ) => {
        const flexStyles = {
            gap: gap ?? `${rowGap || 0} ${columnGap || 0}`,
            alignItems: align,
            justifyContent: justify,
            flexWrap: wrap,
            flexDirection: direction,
            ...style,
        };

        if (asChild) {
            return React.cloneElement(children, {
                style: {
                    ...flexStyles,
                    ...(children.props?.style ?? {}),
                },
                className: classNames(className, children.props?.className, styles.root),
                ...props,
            });
        }

        return (
            <div
                ref={ref} // Gán ref vào div
                style={flexStyles}
                data-full-width={fullWidth}
                className={classNames(className, styles.root)}
                {...props}
            >
                {children}
            </div>
        );
    },
);

export default Flex;

Flex.displayName = 'Flex';
