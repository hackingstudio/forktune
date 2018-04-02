
import {race, select, take} from 'redux-saga/effects';
import { LOCATION_CHANGED } from 'redux-little-router/es/types';
import {Views} from "../routing";
import {eventChannel, Task} from "redux-saga";
import {forkRetry} from "./index";
import {Types} from "../actions";

const EVENT_REGISTER = 'saga-routing-register';

export type Saga = () => Iterator<any>;

const routes: Map<Views, Array<Saga>> = new Map();

export function register(view: Views, saga: Saga) {
    let index = 0;

    if (routes.has(view)) {
        index = routes.get(view)!.push(saga) - 1;
    } else {
        routes.set(view, [saga]);
    }

    document.body.dispatchEvent(
        new CustomEvent(EVENT_REGISTER, {
            detail: { view, index }
        })
    )
}

export function unregister(view: Views, saga: Saga) {
    if (routes.has(view)) {
        const sagas = routes.get(view)!;
        const index = sagas.indexOf(saga);

        if (index === -1) {
            return;
        }

        sagas.splice(index, 1);

        if (sagas.length === 0) {
            routes.delete(view);
        }
    }
}

export default function* () {
    yield take(Types.AUTH_INIT_FINISHED);

    let forks: Array<Task> = [];
    const registerChannel = eventChannel((emitter) => {
        document.body.addEventListener(EVENT_REGISTER, emitter);
        return () => {
            document.body.removeEventListener(EVENT_REGISTER, emitter);
        };
    });

    while (true) {
        const racer = yield race({
            locationChange: take(LOCATION_CHANGED),
            register: take(registerChannel),
        });

        if ('register' in racer) {
            const {view, index} = racer.register.detail;
            const currentView = (yield select()).router.result.view;
            if (view === currentView) {
                yield forkRetry(routes.get(view)![index]);
            }
            continue;
        }

        const action = racer.locationChange;

        console.log(action);

        forks.forEach((task) => task.cancel());
        forks = [];

        const view = action.payload.result.view;
        console.log('started sagas for', view, ':', routes);
        if (routes.has(view)) {
            console.log('wolololo');
            for (const saga of routes.get(view)!) {
                forks.push(yield forkRetry(saga));
            }
        }
    }
}
