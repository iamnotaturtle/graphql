import React, { useEffect, useState } from 'react';
import { useHistory, NavLink } from 'react-router-dom';
import { gql } from 'apollo-boost';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import { ROOT_QUERY } from './App';

const GITHUB_AUTH_MUTATION = gql`
    mutation githubAuth($code:String!) {
        githubAuth(code:$code) { token } 
    }
`

const authorizationComplete = (cache, { data }, history, setSigningIn) => {
    localStorage.setItem('token', data.githubAuth.token);
    history.replace('/');
    setSigningIn(false);
}

const logout = (client) => {
    localStorage.removeItem('token');
    let data = Object.assign({}, client.readQuery({ query: ROOT_QUERY }));
    data.me = null;
    client.writeQuery({ query: ROOT_QUERY, data });
}

const requestCode = () => {
    const clientID = process.env.REACT_APP_CLIENT_ID;
    window.location =
`https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`;
}

const Me = ({ logout, requestCode, signingIn }) => {
    const { loading, error, data } = useQuery(ROOT_QUERY);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;
    
    if(!data.me) {
        return (
            <button onClick={requestCode} 
                disabled={signingIn}> 
                Sign In with GitHub
            </button>
        );
    }

    return (
        <CurrentUser {...data.me} logout={logout} />
    );
};

const CurrentUser = ({ name, avatar, logout }) =>
    <div>
        <img src={avatar} width={48} height={48} alt="" />
        <h1>{name}</h1>
        <button onClick={logout}>logout</button>
        <NavLink to="/newPhoto">Post Photo</NavLink>
    </div>

const AuthorizedUser = () => {
    const client = useApolloClient();
    const history = useHistory();
    const [signingIn, setSigningIn] = useState(false);

    const [githubAuthMutation] = useMutation(GITHUB_AUTH_MUTATION, {
        update: (cache, { data }) => authorizationComplete(cache, { data }, history, setSigningIn),
        refetchQueries: [{ query: ROOT_QUERY }],
    });

    useEffect(() => {
        if (window.location.search.match(/code=/)) {
            setSigningIn(true);
            const code = window.location.search.replace('?code=', '');
            history.replace('/');
            githubAuthMutation({ variables: { code }})
        }
    }, [history, githubAuthMutation]);

    return (
        <Me 
            signingIn={signingIn} 
            requestCode={requestCode}
            logout={() => {logout(client)}} 
        />
    );
}

export default AuthorizedUser;