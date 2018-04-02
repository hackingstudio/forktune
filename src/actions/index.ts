
import { Actions as ViewHomeActions } from './view-home';
import { Actions as AuthActions } from './auth';

export type Actions =
    | ViewHomeActions
    | AuthActions;

export const enum Types {
    LOGIN_SPOTIFY = 'LOGIN_SPOTIFY',
    UPDATE_PLAYLISTS = 'UPDATE_PLAYLISTS',
    AUTH_INIT_FINISHED = 'AUTH_INIT_FINISHED',
}
