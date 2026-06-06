import React from 'react';

import Form from './Form';

function FormItem({
    children,
    required,
    rules = [],
    name,
    label,
    placeholder,
    requireMessage,
    whitespaceMessage,
    ...props
}) {
    const _rules = rules || [];
    const _label = label || placeholder || '';

    if (required) {
        _rules.push({
            required: true,
            message: requireMessage || `${_label} không được bỏ trống`,
        });
    }

    const cloneElement = (children) => React.cloneElement(children, { label, placeholder });

    return (
        <Form.Item {...props} name={name} rules={_rules} validateFirst>
            {typeof children === 'function'
                ? (control, meta, form) => cloneElement(children(control, meta, form))
                : cloneElement(children)}
        </Form.Item>
    );
}

export default FormItem;
