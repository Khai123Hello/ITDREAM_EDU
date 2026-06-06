import { useDispatch, useSelector } from 'react-redux';
import { selectAppLoading } from '@selectors/app';
import { hideAppLoading, showAppLoading } from '@store/actions/app';

export default function useAppLoading() {
    const dispatch = useDispatch();
    const loading = useSelector(selectAppLoading);

    const setLoading = (loading) => {
        if (loading) dispatch(showAppLoading());
        else dispatch(hideAppLoading());
    };

    return { loading, setLoading };
}
