import routerForBrowser from 'redux-little-router/es/environment/browser-router';

export const enum Views {
    Home = 'Home'
}

const routes = {
    '/': {
        title: 'Home',
        view: Views.Home,
    }
};

export const {
    reducer,
    middleware,
    enhancer,
} = routerForBrowser({ routes });
