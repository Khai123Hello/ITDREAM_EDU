import React from 'react';
import { filterProps } from '@utils/filter-props';

import { InlineStyles } from '../../Box';
import { useGridContext } from '../Grid.context';
import { getBaseValue, getSortedBreakpoints } from '../utils';

const getColumnFlexBasis = (colSpan, columns) => {
    if (colSpan === 'content') {
        return 'auto';
    }

    if (colSpan === 'auto') {
        return '0rem';
    }

    return colSpan ? `${100 / (columns / colSpan)}%` : undefined;
};

const getColumnMaxWidth = (colSpan, columns, grow) => {
    if (grow || colSpan === 'auto') {
        return '100%';
    }

    if (colSpan === 'content') {
        return 'unset';
    }

    return getColumnFlexBasis(colSpan, columns);
};

const getColumnFlexGrow = (colSpan, grow) => {
    if (!colSpan) {
        return undefined;
    }

    return colSpan === 'auto' || grow ? '1' : 'auto';
};

const getColumnOffset = (offset, columns) => (offset === 0 ? '0' : offset ? `${100 / (columns / offset)}%` : undefined);

const keys = (obj) => Object.keys(obj);

export default function GridColVariables({ span, order, offset, selector }) {
    const ctx = useGridContext();

    if (!Object.keys(ctx).length) {
        return null;
    }

    const baseValue = getBaseValue(span);
    const baseSpan = baseValue === undefined ? 12 : getBaseValue(span);

    const baseStyles = filterProps({
        '--col-flex-shrink': '0',
        '--col-order': getBaseValue(order)?.toString(),
        '--col-flex-grow': getColumnFlexGrow(baseSpan, ctx.grow),
        '--col-flex-basis': getColumnFlexBasis(baseSpan, ctx.columns),
        '--col-width': baseSpan === 'content' ? 'auto' : undefined,
        '--col-max-width': getColumnMaxWidth(baseSpan, ctx.columns, ctx.grow),
        '--col-offset': getColumnOffset(getBaseValue(offset), ctx.columns),
    });

    const queries = {};

    if (typeof order === 'object' && order !== null) {
        keys(order).forEach((breakpoint) => {
            if (breakpoint === 'base') return;

            if (!queries[breakpoint]) {
                queries[breakpoint] = {};
            }

            queries[breakpoint]['--col-order'] = order[breakpoint]?.toString();
        });
    }

    if (typeof span === 'object' && span !== null) {
        keys(span).forEach((breakpoint) => {
            if (breakpoint === 'base') return;

            if (!queries[breakpoint]) {
                queries[breakpoint] = {};
            }

            queries[breakpoint]['--col-flex-grow'] = getColumnFlexGrow(span[breakpoint], ctx.grow);
            queries[breakpoint]['--col-flex-basis'] = getColumnFlexBasis(span[breakpoint], ctx.columns);
            queries[breakpoint]['--col-width'] = span[breakpoint] === 'content' ? 'auto' : undefined;
            queries[breakpoint]['--col-max-width'] = getColumnMaxWidth(span[breakpoint], ctx.columns, ctx.grow);
        });
    }

    if (typeof offset === 'object' && offset !== null) {
        keys(offset).forEach((breakpoint) => {
            if (breakpoint === 'base') return;

            if (!queries[breakpoint]) {
                queries[breakpoint] = {};
            }

            queries[breakpoint]['--col-offset'] = getColumnOffset(offset[breakpoint], ctx.columns);
        });
    }

    const sortedBreakpoints = getSortedBreakpoints(keys(queries)).filter(
        (breakpoint) => keys(queries[breakpoint]).length > 0,
    );

    const media = sortedBreakpoints.map((breakpoint) => ({
        query: `(max-width: ${breakpoint})`,
        styles: queries[breakpoint],
    }));

    return <InlineStyles styles={baseStyles} media={media} selector={selector} />;
}
