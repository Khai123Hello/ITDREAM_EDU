import React from 'react';
import { ReactComponent as EyeOpen } from '@assets/icons/eye.svg';
import { ReactComponent as EyeClose } from '@assets/icons/eye-slash.svg';

export const PasswordToggleIcon = ({ reveal, ...props }) => {
    return reveal ? <EyeClose {...props} /> : <EyeOpen {...props} />;
};
