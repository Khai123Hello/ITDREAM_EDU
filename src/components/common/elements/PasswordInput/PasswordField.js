import React from 'react';

import { FormItem } from '../Form';

import PasswordInput from './PasswordInput';
function PasswordField({
    name = '',
    rules = [],
    label = '',
    required = false,
    placeholder = '',
    requireMessage = '',
    fieldProps,
    disabled = false,
    autoComplete = 'off',
    autoCorrect = 'off',
    autoSave = 'off',
    autoCapitalize = 'off',
    autoFill = 'off',
    onChange,
    className,
    ...props
}) {
    return (
        <FormItem
            {...props}
            name={name}
            label={label}
            placeholder={placeholder}
            requireMessage={requireMessage}
            required={required}
            autoComplete={autoComplete}
            autoCorrect={autoCorrect}
            autoSave={autoSave}
            autoCapitalize={autoCapitalize}
            autoFill={autoFill}
            rules={rules}
        >
            <PasswordInput classNames={className} disabled={disabled} onChange={onChange} {...fieldProps} />
        </FormItem>
    );
}

export default PasswordField;
