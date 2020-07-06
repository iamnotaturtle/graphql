import React from 'react'
import { useQuery } from '@apollo/react-hooks' ;
import { ROOT_QUERY } from './App';

const Photos = () => {
    const { loading, error, data} = useQuery(
        ROOT_QUERY,
        {
            fetchPolicy: 'cache-and-network'
        }
    );
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;
    return data.allPhotos.map(photo =>
        <img key={photo.id} src={`http://localhost:4000${photo.url}`} alt={photo.name} width={350} />
    );
};

export default Photos;