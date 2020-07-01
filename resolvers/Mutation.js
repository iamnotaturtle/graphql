const { authorizeWithGithub } = require('../api');
const { toJSON } = require('../api');
const { default: fetch } = require('node-fetch');

module.exports = {
    async postPhoto(parent, args, { db, currentUser }) {
      if (!currentUser) {
        throw new Error('Must be authorized to post photos');
      }

      const newPhoto = {
        userID: currentUser.githubLogin,
        created: new Date(),
        ...args.input
      };

      const { insertedIds } = await db.collection('photos').insert(newPhoto);
      newPhoto.id = insertedIds[0];
      return newPhoto;
    },
    async githubAuth(parent, { code }, { db }) {
      let {
        message,
        access_token,
        avatar_url,
        login,
        name,
      } = await authorizeWithGithub({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
      });

      if (message) {
        throw new Error(message);
      }

      let latestUserInfo = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url,
      };

      const { ops:[user] } = await db
        .collection('users')
        .replaceOne({ githubLogin: login}, latestUserInfo, { upsert: true});

      return { user, token: access_token };
    },
    async addFakeUsers(parent, {count}, {db}) {
      const randomUserApi = `https://randomuser.me/api/?results=${count}`;
      const {results} = await fetch(randomUserApi)
        .then(toJSON);
      
      const users = results.map(r => ({
        githubToken: r.login.sha1,
        githubLogin: r.login.username,
        name: `${r.name.first} ${r.name.last}`,
        avatar: r.picture.thumbnail, 
      }));

      await db.collection('users').insert(users);
      return users;
    },
    async fakeUserAuth(parent, {githubLogin}, {db}) {
      const user = await db.collection('users').findOne({githubLogin});

      if (!user) {
        throw new Error(`Cannot find user with githubLogin "${githubLogin}"`)
      }

      return {
        token: user.githubToken,
        user
      }
    }
};