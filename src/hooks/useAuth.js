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

    // Cần fetch lại profile khi có token nhưng Redux store bị reset (vd: reload trang)
    const immediate = !!token && !profile;

    useFetchAction(accountActions.getProfile, { immediate });
    const permissions = profile?.group?.permissions?.map((permission) => permission.action);
    // const permissionCodes = profile?.group?.permissions?.map((permission) => permission.permissionCode);

    // useActionLoading trả về { loading } object — phải destructure đúng
    const { loading: isLoadingAction } = useActionLoading(accountActions.getProfile.type);

    // loading = true khi:
    // - immediate = true (có token, chưa có profile → đang chuẩn bị fetch)
    // - isLoadingAction = true (đang gọi API getProfile)
    // Điều này đảm bảo ValidateAccess không redirect sang /login trong khi đang chờ xác thực
    const loading = immediate || !!isLoadingAction;

    return { isAuthenticated: !!profile, profile, token, loading, permissions, permissionCodes };
};

export default useAuth;
