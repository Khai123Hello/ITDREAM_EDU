import { accountActions } from '@store/actions';
import { createFailureActionType, createReducer } from '@store/utils';

const { logout, getProfileSuccess, getProfile } = accountActions;

const initialState = {
    profile: null,
};

const accountReducer = createReducer(
    {
        reducerName: 'account',
        initialState,
        // storage: true,
        storage: false,
    },
    {
        [getProfileSuccess.type]: (state, { payload }) => {
            let profile = payload?.data || null;

            // Normalize Student/Educator profile to flat structure (same as Admin)
            // Backend returns: { profileAccountDto: { fullName, avatar, email, ... }, isReviewed?, organization? }
            // We normalize to: { fullName, avatar, email, ..., isReviewed?, organization? }
            if (profile?.profileAccountDto) {
                profile = {
                    ...profile.profileAccountDto,
                    ...(profile.isReviewed !== undefined && { isReviewed: profile.isReviewed }),
                    ...(profile.organization !== undefined && { organization: profile.organization }),
                };
            }

            state.profile = profile;
        },
        [createFailureActionType(getProfile.type)]: (state, { payload }) => {
            // console.log({ payload });
        },
        [logout.type]: (state) => {
            state.profile = null;
        },
    },
);

export default accountReducer;
