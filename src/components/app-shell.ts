import { connect, withStore } from 'fit-html';
import { html } from 'lit-html/lib/lit-extended';
import store from '../store';
import './view-home';

const View = (props: {}) => html`
<h1>ForkTune</h1>
<view-home></view-home>
`;

const Shell = connect(
    (props) => ({}),
    {},
    View,
);

customElements.define(
    'app-shell',
    withStore(Shell, store),
);
