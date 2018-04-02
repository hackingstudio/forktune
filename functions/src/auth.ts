import { https } from "firebase-functions";
import * as request from 'request-promise-native';
import { Agent } from "https";
import { crypto } from './util/crypto';
import { config } from './util/config';
import createCors from 'cors';

const cors = createCors({ origin: true });
const agent = new Agent({ keepAlive: true });

const { client_id, client_secret, encryption_key } = config().spotify;

async function fetchToken(params) {

    const authKey = new Buffer(`${ client_id }:${ client_secret }`).toString('base64');

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

export interface ExchangeCodeResult {
    accessToken: string;
    expiresIn: number;
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
        const { access_token, expires_in, refresh_token } = await fetchToken({
            'grant_type': 'authorization_code',
            code,
            'redirect_uri': redirectUri,
        });

        resp.send({
            accessToken: access_token,
            expiresIn: expires_in,
            refreshToken: crypto.encrypt(refresh_token, encryption_key),
        });
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
        } = await fetchToken({
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
