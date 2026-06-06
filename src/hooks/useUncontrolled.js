import { useState } from 'react';

export default function useUncontrolled({
    value,
    defaultValue,
    onChange,
    mappingOnChange = (e) => e?.target?.value ?? e,
} = {}) {
    const [ unControlledValue, setUnControlledValue ] = useState(defaultValue);
    const handleUncontrolledChange = (e) => {
        setUnControlledValue(mappingOnChange(e));
        onChange?.(e);
    };

    if (value !== undefined) {
        return [ value, onChange ];
    }

    return [ unControlledValue, handleUncontrolledChange ];
}
