export const getData = (key) => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        const dataStorage = window.sessionStorage.getItem(key);
        try {
            return JSON.parse(dataStorage);
        } catch (error) {
            return dataStorage;
        }
    }
    return false;
};

export const setData = (key, data) => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, typeof data === 'object' ? JSON.stringify(data) : data);
    }
};

export const removeItem = (key) => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
    }
};

export const getObjectData = (key) => {
    let result = false,
        jsonData;
    if (window.sessionStorage && (jsonData = window.sessionStorage.getItem(key))) {
        try {
            result = JSON.parse(jsonData);
        } catch {
            // eslint-disable-next-line no-console
            console.error('error');
        }
    }
    return result;
};
