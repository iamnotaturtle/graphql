import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { gql } from 'apollo-boost';
import { useApolloClient } from '@apollo/react-hooks';
import AuthorizedUser from './AuthorizedUser';
import Users from './Users';

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
    <div>
      <AuthorizedUser /> 
      <Users />
    </div> 
  </BrowserRouter>
  );
}

export default App
