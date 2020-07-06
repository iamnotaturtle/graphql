import React from 'react'
import { render } from 'react-dom'
import App from './App'
import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache, HttpLink, ApolloLink, split, ApolloClient } from 'apollo-boost';
import { persistCache } from 'apollo-cache-persist';
import { WebSocketLink } from 'apollo-link-ws' ;
import { getMainDefinition } from 'apollo-utilities';
import { createUploadLink } from 'apollo-upload-client'

const httpLink = new createUploadLink({ uri: 'http://localhost:4000/graphql' });
const wsLink = new WebSocketLink({
    uri: `ws://localhost:4000/graphql`,
    options: { reconnect: true }
});

const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(context => ({
            headers: {
                ...context.headers,
                authorization: localStorage.getItem('token'),
            }
        })
    );
    return forward(operation);
});
const httpAuthLink = authLink.concat(httpLink);
const link = split(
    ({query}) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpAuthLink,
);

export const cache = new InMemoryCache() 
persistCache({
    cache,
    storage: localStorage 
});
if (localStorage['apollo-cache-persist']) {
    let cacheData = JSON.parse(localStorage['apollo-cache-persist']);
    cache.restore(cacheData);
}

export const client = new ApolloClient({
    cache,
    link,
    uri: 'http://localhost:4000/graphql',
    request: operation => {
        operation.setContext(context => ({
            headers: {
                ...context.headers,
                authorization: localStorage.getItem('token'),
            }
        })
        )
    }
 })
render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>, 
    document.getElementById('root')
)
