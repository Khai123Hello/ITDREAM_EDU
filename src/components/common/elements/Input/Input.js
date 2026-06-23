import React, { useEffect, useRef } from 'react';
import { ReactComponent as SearchIcon } from '@assets/icons/search-normal.svg';
import useUncontrolled from '@hooks/useUncontrolled';
import { extractStyleProps } from '@utils/extract-style-props';
import cls from 'classnames';
import { isNull } from 'lodash';

import Box from '../Box';

import './Input.scss';
import styles from './Input.module.scss';

function Input({
    disabled = false,
    error,
    style,
    id,
    required,
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
    addonAfter,
    onlyDigit = false,
    withSearch = false,
    ...props
}) {
    const { styleProps, rest } = extractStyleProps(props);
    const [_value, _onChange] = useUncontrolled({
        value: isNull(value) ? '' : value,
        onChange,
        defaultValue: '',
    });

    const inputRef = useRef();
    const finalInputRef = innerRef || inputRef;

    const _leftSection = withSearch ? <SearchIcon /> : leftSection;

    useEffect(() => {
        const handleTouchMove = (e) => {
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
            data-with-left-section={!!_leftSection}
            data-with-right-section={!!rightSection}
            data-with-search={withSearch}
            data-variant={variant}
            style={{
                '--input-left-section-width': leftSectionWidth,
                '--input-right-section-width': rightSectionWidth,
                '--input-left-section-pointer-events': leftSectionPointerEvents,
                '--input-right-section-pointer-events': rightSectionPointerEvents,
            }}
            className={cls(className, classNames?.wrapper, styles.wrapper)}
            title={label || placeholder}
        >
            {_leftSection && (
                <div data-position="left" className={cls(classNames?.section, styles.section)}>
                    {withSearch ? <SearchIcon /> : _leftSection}
                </div>
            )}
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}
            <div className={cls(addonAfter && 'input-addon')}>
                <input
                    {...rest}
                    style={style}
                    tabIndex={0}
                    ref={finalInputRef}
                    data-error={!!error}
                    data-label={!!label}
                    data-has-value={value != undefined && value !== ''}
                    className={addonAfter ? 'none-input' : cls(classNames?.input, styles.input)}
                    placeholder={placeholder}
                    id={id}
                    disabled={disabled}
                    type={type}
                    inputMode={type === 'number' ? 'numeric' : undefined}
                    value={_value}
                    onChange={_onChange}
                />
                {addonAfter && (
                    <span className="addon">
                        <p>{addonAfter}</p>
                    </span>
                )}
            </div>
            {rightSection && (
                <div data-position="right" className={cls(classNames?.section, styles.section)}>
                    {rightSection}
                </div>
            )}
        </Box>
    );
}

export default Input;
