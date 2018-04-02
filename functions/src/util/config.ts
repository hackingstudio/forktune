import { config as firebaseConfig } from "firebase-functions";
import * as admin from "firebase-admin";
// import { CLIENT_ID, CLIENT_SECRET, ENCRYPTION_KEY } from './spotify.config'

declare function require(name:string);

let credential;

try {
    // TODO: 💩
    const { serviceAccount } = require('./service-account');
    credential = admin.credential.cert(serviceAccount);
} catch (e) {
    credential = admin.credential.applicationDefault();
}

admin.initializeApp({
    ...firebaseConfig().firebase,
    credential,
});

export function config() {
    const firebaseConfigObject = firebaseConfig();
    if (!('spotify' in firebaseConfigObject)) {
        const spotifyConfig = require('../../spotify.config');
        firebaseConfigObject.spotify = {
            client_id: spotifyConfig.CLIENT_ID,
            client_secret: spotifyConfig.CLIENT_SECRET,
            encryption_key: spotifyConfig.ENCRYPTION_KEY,
        }
    }
    return firebaseConfigObject;
}
