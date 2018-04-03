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

<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">

<style>

ul {
    list-style-type: none;
    padding: 0;
}
li {
    font-size: 2rem;
    border-bottom: thin #909090 solid;
    padding: 0.1rem 0.5rem;
}
</style>

${!props.loggedIn ? html`
<div style="text-align: center">
    <button style="font-size: 1.5rem;" type="button" class="btn btn-success" on-click="${ props.loginSpotify }">
        Login via Spotify
    </button>
</div>` : ''}
<ul>
${props.playlists.map((playlist) => html`
    <li>${playlist.name}</li>
`)}
</ul>
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
