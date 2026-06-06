import React from 'react';
import { filterProps } from '@utils/filter-props';
import { castArray } from 'lodash';

import { InlineStyles } from '../Box';

import { getBaseValue, getSortedBreakpoints } from './utils';

const getQueries = (gutter) => {
    if (typeof gutter === 'object' && gutter !== null) {
        return Object.keys(gutter).reduce((acc, breakpoint) => {
            if (breakpoint === 'base') return acc;

            if (!acc[breakpoint]) {
                acc[breakpoint] = {};
            }

            acc[breakpoint]['--grid-gutter'] = gutter[breakpoint];

            return acc;
        }, {});
    }

    return {};
};

export function GridVariables({ gutter, selector }) {
    const convertedGutter = castArray(getBaseValue(gutter));
    const baseStyles = filterProps({
        '--grid-gutter-x': convertedGutter[0],
        '--grid-gutter-y': convertedGutter[1],
    });

    const queries = getQueries(gutter);

    const sortedBreakpoints = getSortedBreakpoints(Object.keys(queries)).filter(
        (breakpoint) => Object.keys(queries[breakpoint]).length > 0,
    );

    const media = sortedBreakpoints.map((breakpoint) => ({
        query: `(max-width: ${breakpoint})`,
        styles: queries[breakpoint],
    }));

    return <InlineStyles styles={baseStyles} media={media} selector={selector} />;
}
