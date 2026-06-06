import apiConfig from '@constants/apiConfig';
import { accountActions } from '@store/actions';
import { processAction } from '@store/utils';
import { takeLatest } from 'redux-saga/effects';

const loginSaga = (payload) => processAction(apiConfig.account.login, payload);

const getProfileSaga = (payload) => {
    return processAction(apiConfig.account.getProfileStudent, payload);
};

const sagas = [
    takeLatest(accountActions.login.type, loginSaga),
    takeLatest(accountActions.getProfile.type, getProfileSaga),
];

export default sagas;
