import '@polymer/paper-button/paper-button';
import '@polymer/paper-item/paper-item';
import '@polymer/iron-icons/iron-icons';

import { connect } from 'fit-html';
import { html } from 'lit-html/lib/lit-extended';
import { loginSpotify } from "../actions/view-home";
import saga from '../sagas/view-home';
import {Views} from "../routing";
import {register} from "../sagas/routing";
import {State} from "../state";
import {loadAuthData} from "../util/spotify";

register(Views.Home, saga);

interface ViewHomeProps {
    playlists: any[];
    loggedIn: boolean;
}

interface ViewHomeDispatch {
    loginSpotify: typeof loginSpotify;
}

const View = (props: ViewHomeProps & ViewHomeDispatch) => html`

<style>
paper-button > img {
    height: 2rem; 
}
</style>

<style is="custom-style">
paper-button.spotify {
    background-color: #1db954;
    color: white;
}
paper-item {
    font-size: 1.5rem;
}
</style>

<style is="custom-style" include="paper-item-shared-styles"></style>

${!props.loggedIn ? html`
<div style="text-align: center">
    <paper-button class="spotify" style="font-size: 1.25rem;" on-click="${ props.loginSpotify }">
        Login via&nbsp;<img src="Spotify_Logo_RGB_White.png" />
    </paper-button>
</div>` : ''}

<paper-listbox>
${props.playlists.map((playlist) => html`
    <paper-item><iron-icon icon="icons:view-list"></iron-icon>&nbsp;${playlist.name}</paper-item>
`)}
</paper-listbox>
<div style="height: 1rem;"></div>
`;

const mapStateToProps = (state: State): ViewHomeProps => ({
    playlists: Object.values(state.playlistsSpotify),
    loggedIn: !!loadAuthData(),
});

const mapDispatchToProps: ViewHomeDispatch = {
    loginSpotify
};

customElements.define(
    'view-home',
    connect(
        mapStateToProps,
        mapDispatchToProps,
        View,
    ),
);
