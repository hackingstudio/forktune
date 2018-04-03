import { connect, withStore } from 'fit-html';
import { html, svg } from 'lit-html/lib/lit-extended';
import store from '../store';
import './view-home';

const View = (props: {}) => html`
<style>
a, a:visited, a:hover, a:active {
    color: #ebebeb;
    text-decoration: none;
}

 a:hover {
    text-decoration: underline;
 }
</style>

<div style="text-align: center;"><img src="logo_full.svg" /></div>
<view-home></view-home>
<footer><div style="text-align: center;"><a href="https://hacking.studio/">hacking ❤ studio</a></div></footer>
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
