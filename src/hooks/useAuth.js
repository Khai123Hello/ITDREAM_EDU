import { useSelector } from 'react-redux';
import accountSelectors from '@selectors/account';
import { getCacheAccessToken } from '@services/userService';
import { accountActions } from '@store/actions';
import { jwtDecode } from 'jwt-decode';

import useActionLoading from './useActionLoading';
import useFetchAction from './useFetchAction';

const useAuth = () => {
    const profile = useSelector(accountSelectors.selectProfile);
    const token = getCacheAccessToken();
    let permissionCodes = [];
    if (token) {
        const decoded = jwtDecode(token);
        permissionCodes =
            decoded?.authorities?.length > 0 ? decoded?.authorities.map((role) => role.replace(/^ROLE_/, '')) : [];
    }

    const immediate = !!token && !profile;

    useFetchAction(accountActions.getProfile, { immediate });
    const permissions = profile?.group?.permissions?.map((permission) => permission.action);
    // const permissionCodes = profile?.group?.permissions?.map((permission) => permission.permissionCode);
    const { loading } = useActionLoading(accountActions.getProfile.type);

    return { isAuthenticated: !!profile, profile, token, loading: immediate || loading, permissions, permissionCodes };
};

export default useAuth;
