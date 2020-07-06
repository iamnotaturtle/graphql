require("dotenv").config();
const { ApolloServer, PubSub } = require("apollo-server-express");
const express = require("express");
const expressPlayground = require("graphql-playground-middleware-express")
  .default;
const { readFileSync } = require("fs");
const { MongoClient } = require("mongodb");
const { createServer } = require("http");
const path = require("path");
const depthLimit = require("graphql-depth-limit");
const { createComplexityLimitRule } = require("graphql-validation-complexity");
const { resolvers } = require("./resolvers");
const typeDefs = readFileSync("server/typeDefs.graphql", "UTF-8");

async function start() {
  const MONGO_DB = process.env.DB_HOST;
  const client = await MongoClient.connect(MONGO_DB, { useNewUrlParser: true });
  const db = client.db();

  const app = express();

  const pubsub = new PubSub();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [
      depthLimit(5),
      createComplexityLimitRule(1000, {
        onCost: (cost) => console.log("query cost: ", cost),
      }),
    ],
    context: async ({ req, connection }) => {
      const githubToken = req
        ? req.headers.authorization
        : connection.context.Authorization;

      const currentUser = await db.collection("users").findOne({ githubToken });
      return { db, currentUser, pubsub };
    },
  });

  app.get("/", (req, res) => res.end("Photo sharin and carin"));
  app.get(
    "/playground",
    expressPlayground({ endpoint: "http://localhost:4000/graphql" })
  );
  app.use(
    "/img/photos",
    express.static(path.join(__dirname, "assets", "photos"))
  );

  server.applyMiddleware({ app });
  const httpServer = createServer(app);
  httpServer.timeout = 5000;
  server.installSubscriptionHandlers(httpServer); // Web socket support

  httpServer.listen({ port: 4000 }, () => {
    console.log(`Runnin on http://localhost:4000${server.graphqlPath}`);
  });
}

start();
