# Lyrical-GraphQL
####This repo is meant to be an example for GraphQL in the front end utilizing the Apollo Client

##Technologies Used
- apollo-client - This is what interacts with the graphql server. It's also what stores
the data from the response when it comes back
- react-apollo - imported as **ApolloProvider**. This goes in the root of your application. Imagine like redux or react router.
- graphql-tag - allows us to write a graphql query inside a component file
```angular2html
const client = new ApolloClient({
  dataIdFromObject: o => o.id
});

const Root = () => {
  return (
    <ApolloProvider client={client}>
      <Router history={hashHistory}>
        <Route path="/" component={App}>
          <IndexRoute component={SongList} />
          <Route path="songs/new" component={SongCreate} />
          <Route path="songs/:id" component={SongDetail} />
        </Route>
      </Router>
    </ApolloProvider>
  )
};
```
The ApolloProvider is what connects your graphql client to your graphql server

###Front End Component
```angularjs
import React, {Component} from 'react';
import { graphql } from 'react-apollo';
import { Link } from 'react-router';
import gql from 'graphql-tag';

import query from '../queries/fetchSongs';

class SongList extends Component {

  onSongDelete(id) {
    this.props.mutate({ variables: { id } })
      .then(() => this.props.data.refetch());
  }

  renderSongs() {
    return this.props.data.songs.map(({ id, title }) => {
      return (
        <li key={id} className="collection-item">
          <Link to={`/songs/${id}`}>
            {title}
          </Link>
          <i className="material-icons" onClick={ () => this.onSongDelete(id) }>delete</i>
        </li>
      )
    })
  }

  render() {
    if (this.props.data.loading) { return <div>Loading...</div>}
    return(
      <div>
        <ul className="collection">
          {this.renderSongs()}
        </ul>
        <Link to="/songs/new" className="btn-floating btn-large red right">
          <i className="material-icons">add</i>
        </Link>
      </div>
    )
  }
}

const mutation = gql`
  mutation DeleteSong($id: ID) {
    deleteSong(id:$id) {
     id
    }
  }
`;
export default graphql(mutation) (
    graphql(query)(SongList)
);

```
- In this component the `query` is being imported from fetchSongs. The mutation is declared at the bottom.
- The `graphql` invocation at the bottom is the bonding between the graphql query and the component. It also creates the 
`data` object on our `props`
- You'll notice the double invocation of `graphql` at the bottom where we pass the query into apollo to send it to the server.
    - This is necessary do to the way Apollo architecture. One invocation looks like when using redux's `connect` function.
    - The double invocation is needed since `react-apollo` can only handle one query/mutation in each invocation
- The query, when first rendered has no data, but will have a `loading` param on the props object that says `true`
- When the data returns, `loading` will now be `false`, and there will be in the `data` param in the `props` object

###Mutation in Front End Component

```angularjs
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
```
- key thing to see is how `gql` at the bottom gets access to the `title` in `this.state`
    - `this.props.mutate` invokes the mutation at the bottom that's wrapped by `gql`
        - `this.props.mutate` is a promise
    - the `variables` parameter is where you pass your react state/data to the `query variable` in 
    the graphql mutation
- also see the `refetchQueries` parameter
    - This is graphql's way of notifying the react app that it needs to re-render. It is an array of queries that it wants to refetch after
    every mutation. The changes to the query force the re-render in the React app.
    - you add in the `query` with the query you want to rerun
    - you can also add in another parameter, `variables` where you can add in any `query variables` that you might need to run the query
    - there are other ways to re-fetching queries to update the component
        - `this.props.mutate` is a promise. You can use it run a `.then` on the `this.props.data.refetch()`, which will rerun the query,
        refetch the data, and update the component. You'll find this in the `SongList.js` file
        ```
        onSongDelete(id) {
           		this.props.mutate({ variables: { id } })
           			.then(() => this.props.data.refetch());
        }
        ```
- your choice depends on how you associate your queries with your components. 
    1. The `refetchQueries` is used in `SongCreate.js` because it has no idea of the query that's being called. The proof of this is 
    in the `export default graphql(mutation)(SongCreate)`. **The query isn't passed to graphql at all.**
    2.  In `SongList.js` the thennable uses the `.refetch()` off the `data` object that is placed on the props by the passing of the query
    into `graphql` in the `export default` statement
        ```
         onSongDelete(id) {
            this.props.mutate({ variables: { id } })
                .then(() => this.props.data.refetch());
            }
        ```
        - **Note**: `refetch()` is the most straightforward way to force a re-render. It re-runs the query on the server which blows out all
        the current data and replaces it w/ the new data from the query, which forces a re-render
    3.  in the `index.js` file in the client directory, you'll see this code:
        ```angularjs
            const client = new ApolloClient({
              dataIdFromObject: o => o.id
            });
        ```
        - concentrate on the `dataIdFromObject` parameter being passed.
        - `o` is short for object
        - this takes **every piece of data** that is fetched by the Apollo client from the backend and runs it through this function
            - it looks for the `id` of the record to identify it as unique
        - **Disclaimer** - Apollo does not like to assume that all ids are unique, which is why this is turned off by default. This should only 
        be used if it is known that all `ids ` are unique.
        - **Also, we need to now ask for the id inside of each query that we make, including nested queries that have are expected responses from
        a mutation**
        - **Benefit** - this will cut down on your number of requests, due to the way that Apollo Client works