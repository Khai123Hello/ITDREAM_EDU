import { useState } from 'react';
import React from 'react';

import { UnstyledButton } from '../Button';
import Input from '../Input';

import { PasswordToggleIcon } from './PasswordToggleIcon';

import styles from './PasswordInput.module.scss';

function PasswordInput({
    error,
    placeholder,
    disabled,
    id,
    value,
    onChange,
    autoComplete = 'off',
    autoCorrect = 'off',
    autoSave = 'off',
    autoCapitalize = 'off',
    autoFill = 'off',
    label,
    classNames,
    ...props
}) {
    const [ visible, setVisible ] = useState(false);

    const toggleVisibility = () => setVisible((prev) => !prev);

    const visibilityToggleButton = (
        <UnstyledButton
            className={styles.toggleButton}
            tabIndex={-1}
            onMouseDown={(event) => {
                event.preventDefault();
                toggleVisibility();
            }}
            onKeyDown={(event) => {
                if (event.key === ' ') {
                    event.preventDefault();
                    toggleVisibility();
                }
            }}
        >
            <PasswordToggleIcon reveal={visible} />
        </UnstyledButton>
    );

    return (
        <Input
            {...props}
            label={label}
            error={error}
            disabled={disabled}
            placeholder={placeholder}
            className={classNames}
            id={id}
            value={value}
            onChange={onChange}
            type={visible ? 'text' : 'password'}
            rightSection={visibilityToggleButton}
            rightSectionPointerEvents="all"
            autoComplete={autoComplete}
            autoCorrect={autoCorrect}
            autoSave={autoSave}
            autoCapitalize={autoCapitalize}
            autoFill={autoFill}
        />
    );
}

export default PasswordInput;
