import React from 'react';
import classNames from 'classnames';

import Box from '../../Box';
import { useRandomClassName } from '../utils';

import GridColVariables from './GridColVariables';

import styles from './GridCol.module.scss';

export default function GridCol({ offset, span = 12, order, className, children, ...props }) {
    const responsiveClassName = useRandomClassName();

    if (!children) return null;

    return (
        <>
            <GridColVariables selector={`.${responsiveClassName}`} span={span} order={order} offset={offset} />
            <Box {...props} className={classNames(styles.col, responsiveClassName, className)}>
                {children}
            </Box>
        </>
    );
}
