import { connect } from 'fit-html';
import { html } from 'lit-html/lib/lit-extended';
import { loginSpotify } from "../actions/view-home";
import saga from '../sagas/view-home';
import {Views} from "../routing";
import {register} from "../sagas/routing";
import {State} from "../state";

register(Views.Home, saga);

interface ViewHomeProps {
    playlists: any[];
}

interface ViewHomeDispatch {
    loginSpotify: typeof loginSpotify;
}

const View = (props: ViewHomeProps & ViewHomeDispatch) => html`
<button on-click="${ props.loginSpotify }">Login via Spotify</button>
<ol>
${props.playlists.map((playlist) => html`
    <li>${playlist.name}</li>
`)}
</ol>
`;

const mapStateToProps = (state: State): ViewHomeProps => ({
    playlists: Object.values(state.playlistsSpotify),
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
