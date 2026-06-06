import { createAction } from '@store/utils';

export const showAppLoading = createAction('app/SHOW_LOADING');
export const hideAppLoading = createAction('app/HIDE_LOADING');
export const toggleActionLoading = createAction('app/ACTION_LOADING');
export const changeLanguage = createAction('app/CHANGE_LANGUAGE');
export const uploadFile = createAction('app/UPLOAD_FILE');

export const showCollapse = createAction('app/SHOW_COLLAPSE');
export const hideCollapse = createAction('app/HIDE_COLLAPSE');
export const showAppCartModal = createAction('app/SHOW_CART_MODAL');
export const hideAppCartModal = createAction('app/HIDE_CART_MODAL');
export const setRestaurantId = createAction('app/SET_RESTAURANT_ID');
export const actions = {
    showAppLoading,
    hideAppLoading,
    toggleActionLoading,
    changeLanguage,
    uploadFile,
    showAppCartModal,
    hideAppCartModal,
    showCollapse,
    hideCollapse,
    setRestaurantId,
};
