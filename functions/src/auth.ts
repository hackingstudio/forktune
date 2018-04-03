import { https } from "firebase-functions";
import * as admin from 'firebase-admin';
import * as request from 'request-promise-native';
import { Agent } from "https";
import { crypto } from './util/crypto';
import { config } from './util/config';
import createCors from 'cors';
import {URL} from "url";

const cors = createCors({ origin: true });
const agent = new Agent({ keepAlive: true });

const { client_id, client_secret, encryption_key } = config().spotify;
const authKey = new Buffer(`${ client_id }:${ client_secret }`).toString('base64');

async function fetchSpotifyToken(params) {
    return request.post({
        agent,
        uri: 'https://accounts.spotify.com/api/token',
        form: params,
        headers: {
            'Authorization': `Basic ${authKey}`
        },
        json: true,
    });
}

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}

export interface ExchangeCodeResult {
    accessToken: string;
    expiresIn: number;
    firebaseToken: string;
    refreshToken: string;
}

export interface ExchangeCodeParams {
    code: string;
    redirectUri: string;
}

export const exchangeCode = https.onRequest( (req, resp) => cors(req, resp, async () => {
    const { code, redirectUri }: ExchangeCodeParams = req.body;

    if (!code || !redirectUri) {
        resp.status(400).send('Parameter code or redirectUri missing');
        return;
    }

    try {
        const { access_token, expires_in, refresh_token } = await fetchSpotifyToken({
            'grant_type': 'authorization_code',
            code,
            'redirect_uri': redirectUri,
        });

        const user = await request.get({
            agent,
            uri: `https://api.spotify.com/v1/me`,
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            json: true,
        });

        const userData = {
            email: user.email,
            emailVerified: false,
            displayName: user.display_name,
            photoURL: (user.images && user.images.length > 0 && isValidUrl(user.images[0].url))
                ? user.images[0].url
                : undefined,
            disabled: false,
        };

        try {
            await admin.auth().updateUser(user.uri, userData);
        } catch {
            await admin.auth().createUser({
                uid: user.uri,
                ...userData,
            });
        }

        const firebaseToken = await admin.auth().createCustomToken(user.uri);

        resp.send({
            accessToken: access_token,
            expiresIn: expires_in,
            firebaseToken: firebaseToken,
            refreshToken: crypto.encrypt(refresh_token, encryption_key),
        } as ExchangeCodeResult);
    } catch (e) {
        resp.status(500).send(e.message);
    }
}));


export interface RefreshAccessTokenParams {
    refreshToken: string;
}

export interface RefreshAccessTokenResult {
    accessToken: string;
    scope: string;
    expiresIn: number;
}

export const refreshAccessToken = https.onRequest( (req, resp) => cors(req, resp, async () => {
    const { refreshToken }: RefreshAccessTokenParams = req.body;

    if (!refreshToken) {
        resp.status(400).send('Parameter refreshToken missing');
        return;
    }

    try {

        const {
            access_token,
            token_type,
            scope,
            expires_in,
        } = await fetchSpotifyToken({
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken,
        });

        resp.send({
            accessToken: access_token,
            scope,
            expiresIn: expires_in,
        } as RefreshAccessTokenResult);
    } catch (e) {
        resp.status(500).send(e.message);
    }
}));
