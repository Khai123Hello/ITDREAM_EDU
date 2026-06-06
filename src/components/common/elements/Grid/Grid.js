import React from 'react';
import classNames from 'classnames';

import Box from '../Box';

import GridCol from './Col/GridCol';
import { GridProvider } from './Grid.context';
import { GridVariables } from './GridVariables';
import { useRandomClassName } from './utils';

import styles from './Grid.module.scss';
/*
span: number | "auto" | "content"
    auto: full remaining space
    content: fit content
*/

function Grid({
    justify,
    align,
    overflow,
    gutter = '1.6rem',
    grow = false,
    columns = 12,
    children,
    className,
    ...props
}) {
    const responsiveClassName = useRandomClassName();
    return (
        <GridProvider grow={grow} columns={columns}>
            <GridVariables selector={`.${responsiveClassName}`} gutter={gutter} />
            <Box
                {...props}
                style={{
                    '--grid-justify': justify,
                    '--grid-align': align,
                    '--grid-overflow': overflow,
                }}
                className={classNames(styles.root, responsiveClassName, className)}
            >
                <div className={styles.inner}>{children}</div>
            </Box>
        </GridProvider>
    );
}

Grid.Col = GridCol;

export default Grid;
