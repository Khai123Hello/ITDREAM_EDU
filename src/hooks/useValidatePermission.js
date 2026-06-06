import React, { useCallback } from 'react';
import { validatePermission } from '@utils';

import useAuth from './useAuth';

function useValidatePermission() {
    const { permissions, kind, profile, permissionCodes } = useAuth();

    const hasPermission = useCallback(
        (requiredPermissions, requiredKind, excludeKind, onValidate, kindSystem, path, separate) => {
            const _onValidate = onValidate ?? validatePermission;
            return _onValidate(
                requiredPermissions,
                permissionCodes,
                requiredKind,
                excludeKind,
                kind,
                profile,
                path,
                separate,
                kindSystem,
            );
        },
        [ permissionCodes, kind ],
    );

    return hasPermission;
}

export default useValidatePermission;
