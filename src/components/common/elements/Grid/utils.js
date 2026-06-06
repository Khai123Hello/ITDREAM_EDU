import { useId } from 'react';
import { isPlainObject } from 'lodash';

export function useRandomClassName() {
    const id = useId().replace(/:/g, '');
    return `__gird_${id}`;
}

export function getSortedBreakpoints(breakpoints) {
    return breakpoints.sort((a, b) => (a > b ? 1 : -1));
}

export function getBaseValue(value) {
    if (isPlainObject(value)) {
        if ('base' in value) {
            return value.base;
        }

        return undefined;
    }

    return value;
}
