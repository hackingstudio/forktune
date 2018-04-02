import { Types } from '.';

export type Actions =
    | LoginSpotifyAction
    | UpdatePlaylistsAction;

export interface LoginSpotifyAction {
    type: Types.LOGIN_SPOTIFY;
}

export interface UpdatePlaylistsAction {
    type: Types.UPDATE_PLAYLISTS;
    payload: Array<any>;
}

export function loginSpotify(): LoginSpotifyAction {
    return {
        type: Types.LOGIN_SPOTIFY,
    }
}

export function updatePlaylists(playlists: Array<any>): UpdatePlaylistsAction {
    return {
        type: Types.UPDATE_PLAYLISTS,
        payload: playlists,
    }
}
