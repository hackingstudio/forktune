import { Types } from '../actions';
import {call, fork, put, take, takeEvery} from 'redux-saga/effects';
import { stringify } from 'qs';
import { CLIENT_ID } from '../../spotify.config';
import { replace } from "redux-little-router/es/actions";
import { LOCATION_CHANGED } from 'redux-little-router/es/types';
import {
    SCOPES,
    exchangeCode as spotifyExchangeCode,
    storeAuthData,
} from "../util/spotify";
import {authInitFinished} from "../actions/auth";

const OAUTH_STATE = 'POPOPO';

const spotifyOAuthQueryString = stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: window.location.origin,
    state: OAUTH_STATE,
    scope: SCOPES.join(' '),
    show_dialog: false,
});

function* exchangeCode() {
    const action = yield take(LOCATION_CHANGED);
    const { code, error, state } = action.payload.query;

    if (state !== OAUTH_STATE) {
        return;
    }

    if (error === 'access_denied') {
        console.error('Spotify denied access 😔');
        return;
    }

    yield put(replace('/', {}));

    const {
        accessToken,
        expiresIn,
        refreshToken,
    } = yield spotifyExchangeCode(code, window.location.origin);

    storeAuthData(accessToken, expiresIn, refreshToken);
}

const spotifyOAuthURL = `https://accounts.spotify.com/authorize?${spotifyOAuthQueryString}`;

export default function* () {
    yield takeEvery(Types.LOGIN_SPOTIFY, function* () { window.location.href = spotifyOAuthURL });
    yield call(exchangeCode);
    yield put(authInitFinished());
}
