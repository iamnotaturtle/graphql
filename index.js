require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const expressPlayground = require("graphql-playground-middleware-express")
  .default;
const { readFileSync } = require("fs");
const { MongoClient } = require("mongodb");
const { resolvers } = require("./resolvers");
const typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");

async function start() {
  const MONGO_DB = process.env.DB_HOST;
  const client = await MongoClient.connect(MONGO_DB, { useNewUrlParser: true });
  const db = client.db();

  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const githubToken = req.headers.authorization;
      const currentUser = await db.collection("users").findOne({ githubToken });
      return { db, currentUser };
    },
  });
  server.applyMiddleware({ app });
  app.get("/", (req, res) => res.end("Photo sharin and carin"));
  app.get("/playground", expressPlayground({ endpoint: "/graphql" }));
  app.listen({ port: 4000 }, () => {
    console.log(`Runnin on http://localhost:4000${server.graphqlPath}`);
  });
}

start();
