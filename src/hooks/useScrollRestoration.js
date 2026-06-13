import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { appName } from '@constants';

const useScrollRestoration = () => {
    const location = useLocation();

    useEffect(() => {
        const root = document.getElementById('root');
        if (!root) return;

        // Lấy vị trí scroll đã lưu
        const savedPosition = sessionStorage.getItem(`${appName}-${location.pathname}`);
        if (savedPosition) {
            root.scrollTop = parseInt(savedPosition, 10);
        }

        // Lưu vị trí scroll khi cuộn
        const handleScroll = () => {
            sessionStorage.setItem(`${appName}-${location.pathname}`, root.scrollTop);
        };

        root.addEventListener('scroll', handleScroll);
        return () => root.removeEventListener('scroll', handleScroll);
    }, [location]);
};

export default useScrollRestoration;
