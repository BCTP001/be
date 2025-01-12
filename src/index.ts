import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";

import { MySQLAPI } from "./datasources/mysql-api";

const typeDefs = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  })
)

const knexConfig = {
  client: "mysql",
  connection: ""
};

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
  });
  const { url } = await startStandaloneServer(
    server,
    {
      context: async () => {
        const { cache } = server;

        return {
          dataSources: {
            mySQLAPI: new MySQLAPI({ knexConfig, cache })
          }
        }
      },
      listen: { port: 8080 }
    }
  );
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();
