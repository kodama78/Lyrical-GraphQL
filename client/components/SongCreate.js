import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Link, hashHistory } from 'react-router';

import query from '../queries/fetchSongs';


class SongCreate extends Component {
	constructor(props) {
		super(props);
		this.state = {
			title: ''
		};
	};

	onSubmit(event) {
		event.preventDefault();
		/**
		 * mutate is found on the props when you use graphql at the bottom to connect them
		 * It has a variables key, which is what you use to set the variable in the graphql mutation
		 * refetchQueries is an array that tells graphql which queries to rerun after a mutate has occurred. This will force a rerender
		 */
		this.props.mutate({
			variables: { title: this.state.title },
			refetchQueries: [{ query }]
		}).then(() => hashHistory.push('/') );
	}

	render() {
		return (
			<div>
				<Link to="/">Back</Link>
				<h3>Create a New Song</h3>
				<form onSubmit={this.onSubmit.bind(this)}>
					<label>Song Title:</label>
					<input onChange={event => this.setState({ title: event.target.value })}
					       value={this.state.title} />
				</form>
			</div>
		)
	}
}

/**
 * This creates the Graphql mutation that is used to add the new song
 * The $title is the key that's found above in the onSubmit function
 * We define the type in what's similar to a function declaration
 * then use the normal graphql mutation language within setting the key title to $title
 */
const mutation = gql`
	mutation AddSong($title: String) {
		addSong(title: $title) {
			title
		}
	}	
`;
/**
 * graphql here is used to "glue" our React component to the apollo client
 */
export default graphql(mutation)(SongCreate);