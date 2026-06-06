import React from 'react';

import { FormItem } from '../Form';

import Input from './Input';
function InputField({
    name = '',
    rules = [],
    label = '',
    required = false,
    placeholder = '',
    requireMessage = '',
    fieldProps,
    disabled = false,
    type = 'text',
    style,
    onChange,
    className,
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
            <Input
                required={required}
                withSearch={type === 'search'}
                className={className}
                onChange={onChange}
                disabled={disabled}
                style={style}
                type={type}
                {...fieldProps}
            />
        </FormItem>
    );
}

export default InputField;
