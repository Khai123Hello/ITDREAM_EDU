import React, { useMemo } from 'react';
import { formatCurrencyValue } from '@utils';

const PriceFormat = ({ value, settings, prefix = '', suffix = '', showZero = true, defaultValue = '0' }) => {
    const formattedPrice = useMemo(() => {
        if (!showZero && (value === 0 || value === '0')) {
            return defaultValue;
        }
        if (value === undefined || value === null || value === '') {
            return defaultValue;
        }
        const formatted = formatCurrencyValue(value, settings);

        return `${prefix}${formatted}${suffix}`;
    }, [value, settings, prefix, suffix, showZero, defaultValue]);

    return <>{formattedPrice}</>;
};

export default PriceFormat;
