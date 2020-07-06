const fetch = require("node-fetch");
const fs = require("fs");

const throwError = (error) => {
  throw new Error(JSON.stringify(error));
};
const toJSON = (res) => res.json();

const requestGithubToken = (credentials) =>
  fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(credentials),
  })
    .then(toJSON)
    .catch((error) => throwError(error));

const requestGithubUserAccount = (token) =>
  fetch(`https://api.github.com/user?access_token=${token}`)
    .then(toJSON)
    .catch(throwError);

const authorizeWithGithub = async (credentials) => {
  const { access_token } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(access_token);
  return { ...githubUser, access_token };
};

const uploadStream = (stream, path) =>
  new Promise((resolve, reject) => {
    stream
      .on("error", (error) => {
        if (stream.truncated) {
          fs.unlinkSync(path);
        }
        reject(error);
      })
      .on("end", resolve)
      .pipe(fs.createWriteStream(path));
  });

module.exports = {
  uploadStream,
  authorizeWithGithub,
  toJSON,
  throwError,
};
