require("dotenv").config();
const { ApolloServer, PubSub } = require("apollo-server-express");
const express = require("express");
const expressPlayground = require("graphql-playground-middleware-express")
  .default;
const { readFileSync } = require("fs");
const { MongoClient } = require("mongodb");
const { createServer } = require("http");
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

  server.applyMiddleware({ app });
  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer); // Web socket support

  httpServer.listen({ port: 4000 }, () => {
    console.log(`Runnin on http://localhost:4000${server.graphqlPath}`);
  });
}

start();
