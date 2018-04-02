import {
    createStore,
    applyMiddleware,
    compose,
    AnyAction,
    GenericStoreEnhancer,
    combineReducers
} from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension/logOnlyInProduction';
import createSagaMiddleware from 'redux-saga';
import { initializeCurrentLocation } from 'redux-little-router/es/actions'
import {
    enhancer as routerEnhancer,
    middleware as routerMiddleware,
    reducer as routerReducer,
} from './routing';
import reducers from './reducers';
import { State } from './state'
import mainSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();
const reducer = (state: State, action: AnyAction): State => state;

const store = createStore<State>(
    combineReducers({
        ...reducers,
        router: routerReducer,
    }),
    compose(
        routerEnhancer,
        applyMiddleware(
            routerMiddleware,
            sagaMiddleware,
        ),
        devToolsEnhancer({}),
    ) as GenericStoreEnhancer,
);

sagaMiddleware.run(mainSaga);

store.dispatch(initializeCurrentLocation(store.getState().router));
export default store;
