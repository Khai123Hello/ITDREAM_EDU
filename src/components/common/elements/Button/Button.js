import React from 'react';
import classNames from 'classnames';

import styles from './Button.module.scss';

const Loader = ({ width = '1.8rem', height = '1.8rem', style, props }) => (
    <svg
        {...props}
        style={{ width, height, ...style }}
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        className="mantine-0"
        viewBox="0 0 38 38"
    >
        <g fill="none" fillRule="evenodd" strokeWidth="5" transform="translate(2.5 2.5)">
            <circle cx="16" cy="16" r="16" strokeOpacity="0.5"></circle>
            <path d="M32 16c0-9.94-8.06-16-16-16">
                <animateTransform
                    attributeName="transform"
                    dur="1s"
                    from="0 16 16"
                    repeatCount="indefinite"
                    to="360 16 16"
                    type="rotate"
                ></animateTransform>
            </path>
        </g>
    </svg>
);

const Button = React.forwardRef(
    (
        {
            children,
            className,
            disabled,
            loading = false,
            fullWidth = false,
            type = 'primary',
            buttonType = 'button',
            iconLeft,
            iconRight,
            onClick,
            leftSection,
            loaderProps,
            ...props
        },
        ref,
    ) => {
        return (
            <button
                disabled={loading || disabled}
                onClick={onClick}
                data-full-width={fullWidth}
                className={classNames(styles.button, styles[type], { [styles.disabled]: disabled }, className)}
                type={buttonType}
                ref={ref}
                {...props}
            >
                {(leftSection || loading) && (
                    <span className={classNames(classNames?.section, styles.section)} data-position="left">
                        {loading ? <Loader {...loaderProps} /> : leftSection}
                    </span>
                )}
                {iconLeft}
                {children}
                {iconRight}
            </button>
        );
    },
);

Button.displayName = 'Button';

export default Button;
