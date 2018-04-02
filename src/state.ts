import { Location } from "redux-little-router";

export type PlaylistsSpotifyState = {[i: string]: any};

export interface State {
    router: Location,
    playlistsSpotify: PlaylistsSpotifyState,
}
