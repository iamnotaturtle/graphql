import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks' ;
import { useHistory } from 'react-router-dom';
import { gql } from 'apollo-boost';

const POST_PHOTO_MUTATION = gql`
    mutation postPhoto($input: PostPhotoInput!) {
        postPhoto(input:$input) {
            id
            name
            url
        }
    }
`;

const postPhoto = async (
    mutation, 
    history, 
    { 
        name,
        description,
        category,
        file,
    }
) => {
    await mutation({
        variables: { input: {
            name,
            description,
            category,
            file,
        }
        }
        }).catch(console.error);
    history.replace('/');
};

const PostPhoto = () => {
    const history = useHistory();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('PORTRAIT');
    const [file, setFile] = useState('');

    const [postPhotoMutation, { data }]  = useMutation(POST_PHOTO_MUTATION);

    return (
        <form onSubmit={e => e.preventDefault()}
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start'
            }}
        >

            <h1>Post a Photo</h1>

            <input type="text"
                style={{ margin: '10px' }}
                placeholder="photo name..."
                value={name}
                onChange={({target}) => setName(target.value)} />
        
            <textarea type="text"
                style={{ margin: '10px' }}
                placeholder="photo description..."
                value={description}
                onChange={({target}) => setDescription(target.value)} />
        
            <select value={category} 
                style={{ margin: '10px' }}
                onChange={({target}) => setCategory(target.value)}>
                <option value="PORTRAIT">PORTRAIT</option>
                <option value="LANDSCAPE">LANDSCAPE</option>
                <option value="ACTION">ACTION</option>
                <option value="GRAPHIC">GRAPHIC</option>
            </select>

            <input type="file"
                style={{ margin: '10px' }}
                accept="image/jpeg"
                onChange={({target}) => setFile(target.files && target.files.length ? target.files[0] : '')} />
            <div style={{ margin: '10px' }}>
                <button onClick={() => postPhoto(postPhotoMutation, history, 
                    {            
                        name,
                        description,
                        category,
                        file
                    }
                )}>
                    Post Photo
                </button> 
                <button onClick={() => history.goBack()}>
                    Cancel
                </button>
            </div>

        </form>
    );
};

export default PostPhoto;
