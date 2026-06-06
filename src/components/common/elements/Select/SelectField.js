import React from 'react';

import { FormItem } from '../Form';

import Select from './Select';

function SelectField({
    name = '',
    rules = [],
    label = '',
    required = false,
    requireMessage = '',
    placeholder = '',
    fieldProps,
    options,
    type = '',
    disabled = false,
    onChange,
    multiple = false,
    getPopupContainer = false,
    allowClear,
    suffixIcon,
    ...props
}) {
    return (
        <FormItem
            {...props}
            name={name}
            required={required}
            requireMessage={requireMessage}
            rules={rules}
            label={label}
            placeholder={placeholder}
        >
            <Select
                getPopupContainer={getPopupContainer}
                multiple={multiple}
                onChange={onChange}
                options={options}
                type={type}
                disabled={disabled}
                allowClear={allowClear}
                suffixIcon={suffixIcon}
                required={required}
                {...fieldProps}
            />
        </FormItem>
    );
}

export default SelectField;
