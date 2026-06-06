import { toast } from 'sonner';

export default function useNotification() {
    return ({ type = 'success', message }) => {
        if (type === 'success') {
            toast.success(message);
        } else if (type === 'error') {
            toast.error(message);
        } else if (type === 'warning') {
            toast.warning(message);
        } else {
            toast(message);
        }
    };
}
