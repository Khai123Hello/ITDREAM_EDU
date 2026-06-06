import React from 'react';

import { FormItem } from '../Form';

import Textarea from './Textarea';
function TextareaField({
    name = '',
    rules = [],
    label = '',
    required = false,
    placeholder = '',
    requireMessage = '',
    fieldProps,
    disabled = false,
    type = 'text',
    onChange,
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
            <Textarea required={required} onChange={onChange} disabled={disabled} type={type} {...fieldProps} />
        </FormItem>
    );
}

export default TextareaField;
