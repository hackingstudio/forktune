import qs from 'qs';

import {
    ExchangeCodeParams,
    RefreshAccessTokenParams,
    RefreshAccessTokenResult,
    ExchangeCodeResult
} from "../../functions/src/auth";


const authUrlBase = (window.location.hostname === 'localhost'
    ? 'http://localhost:5000/forktune-foo/us-central1'
    : `${ window.location.origin }/auth`);


export const LOCAL_STORAGE_KEY = 'AUTH_DATA';

export const SCOPES = [
    'user-read-email',
    'user-read-private',
    'playlist-read-private',
    'playlist-modify-private',
    'playlist-modify-public',
    'playlist-read-collaborative',
    'user-library-read',
];

export function storeAuthData(accessToken: string, expiresIn: number, refreshToken: string) {
    localStorage[LOCAL_STORAGE_KEY] = JSON.stringify({
        accessToken,
        expiresAt: Date.now() + (expiresIn * 1000),
        refreshToken,
    } as SpotifyAuthStorage);
}

export function loadAuthData(): SpotifyAuthStorage {
    return localStorage.getItem(LOCAL_STORAGE_KEY) ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!): null;
}

export class UserNotLoggedInError extends Error {
    constructor() {
        super('User not logged in');
    }
}

export interface SpotifyAuthStorage {
    accessToken: string;
    expiresAt: number;
    refreshToken: string;
}

export type AuthEndpoint = 'exchangeCode' | 'refreshAccessToken';
export type AuthStepParams = ExchangeCodeParams | RefreshAccessTokenParams

async function doAuthStep(
    endpoint: AuthEndpoint,
    body: AuthStepParams,
): Promise<any> {
    const responseRaw = await fetch(`${ authUrlBase }/${ endpoint }`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return responseRaw.json();
}

export async function exchangeCode(code: string, redirectUri: string): Promise<ExchangeCodeResult> {
    return doAuthStep('exchangeCode', {code, redirectUri} as ExchangeCodeParams);
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshAccessTokenResult> {
    return doAuthStep('refreshAccessToken', { refreshToken } as RefreshAccessTokenParams);
}

export async function requireAccessToken() {
    const authString = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (authString === null) {
        throw new UserNotLoggedInError();
    }

    const { accessToken, expiresAt, refreshToken }: SpotifyAuthStorage = JSON.parse(authString);

    if (Date.now() <= expiresAt) {
        return accessToken;
    }

    const {accessToken: newAccessToken, scope, expiresIn} = await refreshAccessToken(refreshToken);

    const availableScopes = scope.split(' ');
    if (!SCOPES.every((item) => availableScopes.indexOf(item) !== 1)) {
        throw new UserNotLoggedInError();
    }

    storeAuthData(newAccessToken, expiresIn, refreshToken);
    return newAccessToken;
}

export async function fetchSpotify(
    endpoint: string,
    params,
    method: string = 'GET',
    all: boolean = false
): Promise<any> {
    const options: RequestInit = {
        method,
        headers: {
            'Authorization': `Bearer ${await requireAccessToken()}`,
            'Content-Type': 'application/json',
        },
    };

    const initialUrl = `https://api.spotify.com/v1/${endpoint}`;

    if (method !== 'GET') {
        return (await fetch(initialUrl, {...options, body: params})).json();
    }

    let url = `${initialUrl}?${qs.stringify(params)}`;

    const items: Array<any> = [];
    while (url !== null) {
        const response = await (await fetch(url, options)).json();

        if (!all) {
            return response;
        }

        items.push(...response.items);
        url = response.next;
    }
    return items;

}
