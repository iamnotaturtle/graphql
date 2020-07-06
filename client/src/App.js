import React, { useEffect, Fragment } from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import { gql } from 'apollo-boost';
import { useApolloClient } from '@apollo/react-hooks';
import AuthorizedUser from './AuthorizedUser';
import Users from './Users';
import Photos from './Photos';
import PostPhoto from './PostPhotos';

export const ROOT_QUERY = gql`
fragment userInfo on User { 
    githubLogin
    name
    avatar
  }
query allUsers {
  totalUsers 
  allUsers {
    ...userInfo
  }
  allPhotos {
    id 
    name 
    url
  }
  me {
    ...userInfo
  }
}`

const LISTEN_FOR_USERS = gql`
  subscription {
    newUser {
      githubLogin
      name
      avatar
    }
  }
`;

const App = () => {
  const client = useApolloClient();

  useEffect(() => {
    const listenForUsers = client
      .subscribe({ query: LISTEN_FOR_USERS })
      .subscribe(({ data: { newUser }}) => {
        const data = Object.assign({}, client.readQuery({ query: ROOT_QUERY }));
        data.totalUsers += 1;
        data.allUsers = [
          ...data.allUsers,
          newUser,
        ];
        client.writeQuery({ query: ROOT_QUERY, data});

        return () => {
          listenForUsers.unsubscribe();
        }
      });
  });

  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path="/"
          component={() => 
            <Fragment>
              <AuthorizedUser /> 
              <Users />
              <Photos />
            </Fragment>
          }
        />
        <Route path="/newPhoto" component={PostPhoto}/>
        <Route component={({ location }) => 
          <h1>"{location.pathname}" not found</h1>
        }/>
      </Switch>
    </BrowserRouter>
  );
}

export default App
