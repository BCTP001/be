import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers/aladinAPIResolver"
import { AladinAPI } from "./datasources/aladinAPI"

import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";

const typeDefs = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  })
)

async function startApolloServer() {

  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  const { url } = await startStandaloneServer(server, {
      listen: { port: 8080 },
      context: async () => {
        return {
          dataSources: {
            aladinAPI: new AladinAPI(),
          }
        }
      }
    }
  );
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();
