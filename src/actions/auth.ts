import {Types} from "./index";

export type Actions =
    | AuthInitFinishedAction;

export interface AuthInitFinishedAction {
    type: Types.AUTH_INIT_FINISHED;
}

export function authInitFinished(): AuthInitFinishedAction {
    return {
        type: Types.AUTH_INIT_FINISHED,
    }
}
