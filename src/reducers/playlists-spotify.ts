import { PlaylistsSpotifyState } from "../state";
import {Actions, Types} from "../actions";

export default function (state: PlaylistsSpotifyState = {}, action: Actions): PlaylistsSpotifyState {
    switch (action.type) {
        case Types.UPDATE_PLAYLISTS:
            return action.payload.reduce((acc, item) => {
                acc[item.id] = item;
                return acc;
            }, {}) as {[i: string]: any};
        default:
            return state;
    }
}
