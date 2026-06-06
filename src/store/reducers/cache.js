import { cacheActions } from '@store/actions';
import { createReducer } from '@store/utils';

const { cacheByName } = cacheActions;

const initialState = {
    cacheData: {},
};

const cacheReducer = createReducer(
    {
        reducerName: 'cache',
        initialState,
    },
    {
        [cacheByName.type]: (state, { payload: { name, data } }) => {
            state.cacheData[name] = data;
        },
    },
);

export default cacheReducer;
