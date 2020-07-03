import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { gql } from 'apollo-boost'
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

const App = () => 
<BrowserRouter>
  <div>
    <AuthorizedUser /> 
    <Users />
  </div> 
</BrowserRouter>

export default App
