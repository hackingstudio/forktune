import {call, fork} from 'redux-saga/effects';
import auth from './auth';
import routing from "./routing";

export default function* mainSaga() {
    yield fork(auth);
    yield fork(routing);
}

function* retrySaga(saga, args: any[], maxTimes) {
    for(let i = 0; i < maxTimes; i++) {
        try {
            yield call.apply(null, [saga].concat(args));
            return;
        } catch(err) {
            console.error(err);
            continue;
        }
    }
}

export const forkRetry = (saga, args = [], maxTimes = 3) => fork(retrySaga, saga, args, maxTimes);
