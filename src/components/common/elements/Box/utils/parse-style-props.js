import { sortMediaQueries } from './sort-media-queries';

export function hasResponsiveStyles(styleProp) {
    if (typeof styleProp !== 'object' || styleProp === null) {
        return false;
    }

    const breakpoints = Object.keys(styleProp);

    if (breakpoints.length === 1 && breakpoints[0] === 'base') {
        return false;
    }

    return true;
}

export function getBaseValue(value) {
    if (typeof value === 'object' && value !== null) {
        if ('base' in value) {
            return value.base;
        }

        return undefined;
    }

    return value;
}

export function getBreakpointKeys(value) {
    if (typeof value === 'object' && value !== null) {
        return Object.keys(value).filter((key) => key !== 'base');
    }

    return [];
}

export function getBreakpointValue(value, breakpoint) {
    if (typeof value === 'object' && value !== null && breakpoint in value) {
        return value[breakpoint];
    }

    return value;
}

export function parseStyleProps({ styleProps, data }) {
    return sortMediaQueries(
        Object.keys(styleProps).reduce(
            (acc, styleProp) => {
                const propertyData = data[styleProp];
                const properties = Array.isArray(propertyData.property)
                    ? propertyData.property
                    : [propertyData.property];
                const baseValue = getBaseValue(styleProps[styleProp]);

                if (!hasResponsiveStyles(styleProps[styleProp])) {
                    properties.forEach((property) => {
                        acc.inlineStyles[property] = baseValue;
                    });

                    return acc;
                }

                acc.hasResponsiveStyles = true;

                const breakpoints = getBreakpointKeys(styleProps[styleProp]);

                properties.forEach((property) => {
                    if (baseValue) {
                        acc.styles[property] = baseValue;
                    }

                    breakpoints.forEach((breakpoint) => {
                        const bp = `(max-width: ${breakpoint})`;
                        acc.media[bp] = {
                            ...acc.media[bp],
                            [property]: getBreakpointValue(styleProps[styleProp], breakpoint),
                        };
                    });
                });

                return acc;
            },
            {
                hasResponsiveStyles: false,
                styles: {},
                inlineStyles: {},
                media: {},
            },
        ),
    );
}
