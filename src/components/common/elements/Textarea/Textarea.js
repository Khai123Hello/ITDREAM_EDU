import React, { useEffect, useRef } from 'react';
import useUncontrolled from '@hooks/useUncontrolled';
import { extractStyleProps } from '@utils/extract-style-props';
import cls from 'classnames';

import Box from '../Box';

import styles from './Textarea.module.scss';

function Textarea({
    disabled = false,
    error,
    id,
    name = '',
    leftSection,
    leftSectionWidth,
    leftSectionPointerEvents = 'none',
    rightSection,
    rightSectionWidth,
    rightSectionPointerEvents = 'none',
    placeholder = '',
    label = '',
    className,
    classNames = {},
    variant = 'default',
    value,
    innerRef,
    onChange,
    type = 'text',
    rows,
    required,
    readOnly,
    ...props
}) {
    const { styleProps, rest } = extractStyleProps(props);
    const [_value, _onChange] = useUncontrolled({ value, onChange, defaultValue: '' });
    const inputRef = useRef();
    const finalInputRef = innerRef || inputRef;

    useEffect(() => {
        const handleTouchMove = () => {
            if (finalInputRef.current) {
                finalInputRef.current.blur();
            }
        };

        const handleTouchStart = (e) => {
            const touchStartY = e.touches[0].clientY;

            const handleTouchMoveCheck = (moveEvent) => {
                const touchMoveY = moveEvent.touches[0].clientY;
                if (Math.abs(touchStartY - touchMoveY) > 10) {
                    handleTouchMove();
                }
            };

            document.addEventListener('touchmove', handleTouchMoveCheck, { passive: true });
            document.addEventListener(
                'touchend',
                () => {
                    document.removeEventListener('touchmove', handleTouchMoveCheck);
                },
                { once: true },
            );
        };

        document.addEventListener('touchstart', handleTouchStart);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
        };
    }, [finalInputRef]);

    return (
        <Box
            {...styleProps}
            data-with-left-section={!!leftSection}
            data-with-right-section={!!rightSection}
            data-variant={variant}
            style={{
                height: '100%',
                '--input-left-section-width': leftSectionWidth,
                '--input-right-section-width': rightSectionWidth,
                '--input-left-section-pointer-events': leftSectionPointerEvents,
                '--input-right-section-pointer-events': rightSectionPointerEvents,
            }}
            className={cls(className, classNames?.wrapper, styles.wrapper)}
        >
            {leftSection && (
                <div data-position="left" className={cls(classNames?.section, styles.section)}>
                    {leftSection}
                </div>
            )}
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}
            <textarea
                {...rest}
                tabIndex={0}
                ref={finalInputRef}
                data-error={!!error}
                data-label={!!label}
                data-has-value={!!_value}
                className={cls(classNames?.input, styles.input)}
                placeholder={label ? '' : placeholder}
                id={id}
                name={name}
                disabled={disabled}
                type={type}
                value={_value}
                onChange={_onChange}
                readOnly={readOnly}
                rows={rows}
            />

            {rightSection && (
                <div data-position="right" className={cls(classNames?.section, styles.section)}>
                    {rightSection}
                </div>
            )}
        </Box>
    );
}

export default Textarea;
