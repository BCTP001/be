import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

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
  });
  const { url } = await startStandaloneServer(
    server,
    {
      context: async () => {
        const { cache } = server;

        return {
          dataSources: {
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
