import { useIntl } from 'react-intl';
import { translateKeys } from '@utils/intlHelper';

export default function useTranslate() {
    const intl = useIntl();
    return Object.assign(intl, { formatKeys: (message, keys = []) => translateKeys(intl, message, keys) });
}
