import { forwardRef } from 'react';
import React from 'react';
import classNames from 'classnames';

import Box from '../Box';

import styles from './UnstyledButton.module.scss';
const UnstyledButton = forwardRef(({ component = 'button', type = 'button', className, children, ...props }, ref) => {
    return (
        <Box {...props} ref={ref} className={classNames(className, styles.root)} type={type} component={component}>
            {children}
        </Box>
    );
});

UnstyledButton.displayName = 'UnstyledButton';

export default UnstyledButton;
