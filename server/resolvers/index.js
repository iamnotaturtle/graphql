const Query = require("./Query");
const Mutation = require("./Mutation");
const Type = require("./Type");

module.exports.resolvers = {
  Query,
  Mutation,
  ...Type,
};
