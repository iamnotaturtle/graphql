import React from 'react'
import { gql } from 'apollo-boost'
import { useQuery, useMutation } from '@apollo/react-hooks' ;
import { ROOT_QUERY } from './App'

const ADD_FAKE_USERS_MUTATION = gql`
mutation addFakeUsers($count:Int!) {
    addFakeUsers(count:$count) { 
        githubLogin
        name
        avatar
    } 
}`

const Users = () => {
    const { loading, error, data, refetch } = useQuery(
        ROOT_QUERY,
        {
            fetchPolicy: 'cache-and-network'
        }
    );
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;
    
    return <UserList count={data.totalUsers}
    users={data.allUsers}
    refetch={refetch} />
}

const UserList = ({ count, users, refetch }) => {
    const [addFakeUsers] = useMutation(
        ADD_FAKE_USERS_MUTATION,
    );

    return <div>
        <p>{count} Users</p>
        <button onClick={() => refetch()}>Refetch</button> 
        <button onClick={() => addFakeUsers({
            variables:  {count: 1},
            refetchQueries: [{query: ROOT_QUERY}]
        })}>Add Fake Users</button> 
        <ul>
            {
                users.map(user =>
                <UserListItem key={user.githubLogin}
                name={user.name}
                avatar={user.avatar} /> )
            }
        </ul> 
    </div>
}

const UserListItem = ({ name, avatar }) => 
<li>
    <img src={avatar} width={48} height={48} alt="" /> 
    {name}
</li>

export default Users;
