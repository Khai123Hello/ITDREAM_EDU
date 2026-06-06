import React from 'react';
import { DATE_SHORT_MONTH_FORMAT } from '@constants';

import { FormItem } from '../Form';

import DatePicker from './DatePicker';

const DatePickerField = ({
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
    picker,
    date,
    showTime = true,
    allowClear,
    dropdownClassName,
    className,
    suffixIcon,
    disabledDate,
    format = 'DD/MM/YYYY',
    ...props
}) => {
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
            <DatePicker
                required={required}
                disabledDate={disabledDate}
                suffixIcon={suffixIcon}
                picker={picker}
                onChange={onChange}
                options={options}
                type={type}
                allowClear={allowClear}
                dropdownClassName={dropdownClassName}
                date={date}
                format={format}
                showTime={showTime}
                disabled={disabled}
                className={className}
                {...fieldProps}
            />
        </FormItem>
    );
};

export default DatePickerField;
