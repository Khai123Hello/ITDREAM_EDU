import React from 'react';

import { FormItem } from '../Form';

import NumberInput from './NumberInput';

function NumberInputField({
    name = '',
    rules = [],
    label = '',
    required = false,
    placeholder = '',
    requireMessage = '',
    fieldProps,
    disabled = false,
    min,
    max,
    step = 1,
    onChange,
    className,
    addonAfter = '',
    ...props
}) {
    return (
        <FormItem
            {...props}
            required={required}
            name={name}
            rules={rules}
            label={label}
            placeholder={placeholder}
            requireMessage={requireMessage}
        >
            <NumberInput
                required={required}
                className={className}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                addonAfter={addonAfter}
                {...fieldProps}
            />
        </FormItem>
    );
}

export default NumberInputField;
