import { config as firebaseConfig } from "firebase-functions";
// import { CLIENT_ID, CLIENT_SECRET, ENCRYPTION_KEY } from './spotify.config'

declare function require(name:string);

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
