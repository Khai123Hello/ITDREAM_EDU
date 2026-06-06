import React from 'react';

import Input from '../Input/Input';

function formatNumber(value) {
    if (!value) return '';
    const numericValue = String(value).replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseNumber(value) {
    return value.replace(/,/g, '');
}

function NumberInput({
    value,
    onChange,
    min,
    max,
    step = 1,
    disabled = false,
    placeholder = '',
    addonAfter = '',
    required,
    ...props
}) {
    const handleChange = (e) => {
        const inputValue = e.target.value;
        const formattedValue = formatNumber(inputValue);
        onChange?.(parseNumber(formattedValue));
    };

    return (
        <Input
            required={required}
            type="text"
            value={formatNumber(value)}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            addonAfter={addonAfter}
            {...props}
        />
    );
}

export default NumberInput;
