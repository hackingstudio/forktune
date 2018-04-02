import {fetchSpotify} from "../util/spotify";
import {put} from "redux-saga/effects";
import {updatePlaylists} from "../actions/view-home";


export default function* () {
    const playlists = yield fetchSpotify('me/playlists', {limit: 50}, 'GET', true);
    yield put(updatePlaylists(playlists));
}
