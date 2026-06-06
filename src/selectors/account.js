import { createSelector } from 'reselect';

export const isAuthenticated = createSelector([ (state) => state.account ], (acc) => acc.isAuthenticated);
export const selectProfile = createSelector([ (state) => state.account ], (acc) => acc.profile);
export const selectAlliance = createSelector([ (state) => state.alliance ], (acc) => acc.alliance);
export const selectToken = createSelector([ (state) => state.account ], (acc) => acc.token);

const accountSelectors = {
    isAuthenticated,
    selectProfile,
    selectToken,
    selectAlliance,
};

export default accountSelectors;
