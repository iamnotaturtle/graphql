import React from 'react'
import { render } from 'react-dom'
import App from './App'
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { persistCache } from 'apollo-cache-persist';

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
