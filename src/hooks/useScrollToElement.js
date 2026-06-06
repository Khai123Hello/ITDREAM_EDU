import { useCallback } from 'react';

const useScrollToElement = () => {
    const scrollToElement = useCallback((id) => {
        const targetElement = document.getElementById(`${id}`); // Thêm tiền tố để đảm bảo id duy nhất
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth', // Cuộn mượt mà
                block: 'start', // Cuộn sao cho phần tử nằm ở đầu viewport
            });
        }
    }, []);

    return scrollToElement;
};

export default useScrollToElement;
