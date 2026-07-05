import React, { useCallback, useContext, useRef } from 'react';
import createCtx from '@utils/create-ctx';
import cls from 'classnames';
import { castArray } from 'lodash';
import {
    default as RcForm,
    Field,
    FieldContext,
    FormProvider as RcFormProvider,
    List,
    useForm,
    useWatch,
} from 'rc-field-form';
import { toast } from 'sonner';

import styles from './Form.module.scss';

const [FormProvider, useFormContext] = createCtx('FormProvider');

export function Form({
    formId,
    form,
    initialValues,
    name,
    validateMessages,
    onFieldsChange,
    onFinish,
    onFinishFailed,
    onValuesChange,
    scrollToFirstError = true,
    children,
    className,
    ...props
}) {
    const itemsRef = useRef({});

    const itemRef = useCallback(
        (name) => (node) => {
            const itemName = castArray(name).join('_');
            if (node) {
                itemsRef.current[itemName] = node;
            } else {
                delete itemsRef.current[itemName];
            }
        },
        [],
    );

    return (
        <FormProvider itemRef={itemRef}>
            <RcForm
                {...props}
                className={className}
                id={formId}
                name={name}
                form={form}
                initialValues={initialValues}
                validateMessages={validateMessages}
                onFieldsChange={onFieldsChange}
                onFinish={onFinish}
                onFinishFailed={(errorInfo) => {
                    if (scrollToFirstError) {
                        const firstFieldName = errorInfo.errorFields[0]?.name;
                        itemsRef.current[firstFieldName]?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                        });
                    }
                    onFinishFailed?.(errorInfo);
                }}
                onValuesChange={onValuesChange}
            >
                {children}
            </RcForm>
        </FormProvider>
    );
}

function Item({ name = '', children, className, classNames = {}, style, ...props }) {
    const { itemRef } = useFormContext();

    return (
        <Field name={name} {...props}>
            {(control, meta, form) => {
                const child =
                    typeof children === 'function'
                        ? children(control, meta, form)
                        : React.cloneElement(children, {
                              ...control,
                              onChange: (e) => {
                                  control.onChange(e);
                                  children.props.onChange?.(e);
                              },
                              error: !!meta.errors.length || undefined,
                          });

                return (
                    <div ref={itemRef(name)} style={style} className={cls(styles.field, className, classNames.root)}>
                        {child}
                        {!!meta.errors.length && (
                            <div className={cls(styles.errors, classNames.errors)}>
                                {React.Children.map(meta.errors, (error) => (
                                    <div className={cls(styles.error, classNames.error)}>{error}</div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }}
        </Field>
    );
}

export const useFormInstance = () => {
    const ctx = useContext(FieldContext);

    return ctx;
};

Object.assign(Form, {
    Item,
    List,
    Field,
    FormProvider: RcFormProvider,
    useForm,
    useWatch,
});

export default Form;
