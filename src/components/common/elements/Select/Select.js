import React, { useEffect, useRef } from 'react';
import { ReactComponent as IconArrowDown } from '@assets/icons/arrow-down-2.svg';
import { ReactComponent as IconClear } from '@assets/icons/clear-icon.svg';
import { ReactComponent as SearchIcon } from '@assets/icons/search-normal.svg';
import useUncontrolled from '@hooks/useUncontrolled';
import { removeAccents } from '@utils';
import classNames from 'classnames';
import { ClampText } from 'itz-react-library';
import { default as RcSelect } from 'rc-select';

import styles from './Select.module.scss';

function Select({
    id,
    options = [],
    allowClear = true,
    showSearch = true,
    value,
    onChange,
    leftSection,
    label,
    type,
    placeholder,
    error,
    defaultValue,
    innerRef,
    withSearch = false,
    multiple = false,
    mode,
    getPopupContainer,
    suffixIcon,
    required,
    ...props
}) {
    const _placeholder = label || placeholder;

    const [_value, _onChange] = useUncontrolled({ value, onChange });

    const hasValue = {
        'data-value': _value != undefined && _value?.length != 0,
    };
    const hasLabel = label && { 'data-label': true };
    const hasError = error && { 'data-error': true };
    const dataType = type && { 'data-type': type };
    const dataAllowClear = allowClear && { 'data-allow-clear': true };

    const inputRef = useRef();
    const finalInputRef = innerRef || inputRef;

    const _leftSection = withSearch ? <SearchIcon /> : leftSection;

    const wrappedOptions = options.map((option) => ({
        ...option,
        label: <ClampText>{option.label}</ClampText>,
    }));

    useEffect(() => {
        const handleTouchMove = (e) => {
            if (finalInputRef.current) {
                const dropdown = document.querySelector('.__select-dropdown');
                const isTouchInsideDropdown = dropdown && dropdown.contains(e.target);

                if (!isTouchInsideDropdown) {
                    finalInputRef.current.blur();
                }
            }
        };

        const handleTouchStart = (e) => {
            const touchStartY = e.touches[0].clientY;

            const handleTouchMoveCheck = (moveEvent) => {
                const touchMoveY = moveEvent.touches[0].clientY;
                const isScrolling = Math.abs(touchStartY - touchMoveY) > 10;

                if (isScrolling) {
                    handleTouchMove(moveEvent);
                }
            };

            document.addEventListener('touchmove', handleTouchMoveCheck, { passive: false });
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
        <div>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}
            <RcSelect
                {...dataType}
                {...hasValue}
                {...hasError}
                {...dataAllowClear}
                mode={multiple ? 'multiple' : mode}
                defaultValue={defaultValue}
                prefixCls="__select"
                value={_value}
                onChange={(value) => (value === undefined ? _onChange(null) : _onChange(value))}
                optionFilterProp="label"
                filterOption={(input, option) =>
                    typeof option.label === 'string'
                        ? removeAccents(option.label)?.toLowerCase().indexOf(removeAccents(input)?.toLowerCase()) >= 0
                        : true
                }
                getPopupContainer={(trigger) => (getPopupContainer ? getPopupContainer() : trigger.parentElement)}
                placeholder={placeholder || label}
                suffixIcon={suffixIcon ? suffixIcon : <IconArrowDown style={{ color: '#A7A7A7' }} />}
                showSearch={showSearch}
                allowClear={allowClear}
                clearIcon={<IconClear />}
                notFoundContent="Không tìm thấy dữ liệu"
                options={wrappedOptions}
                ref={finalInputRef}
                inputRef={finalInputRef}
                {...props}
            />
        </div>
    );
}

export default Select;
