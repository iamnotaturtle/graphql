const Query = require("./Query");
const Mutation = require("./Mutation");
const Type = require("./Type");
const Subscription = require("./Subscription");

module.exports.resolvers = {
  Query,
  Mutation,
  Subscription,
  ...Type,
};
