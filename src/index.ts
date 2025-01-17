import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers as aladinAPIResolver } from "./resolvers/aladinAPIResolver";
import { AladinAPI } from "./datasources/aladinAPI";
import { DataSourceContext } from "./context";
import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";
import { DocumentNode } from "graphql";

const typeDefs: DocumentNode = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  }),
);

const resolvers = [
    aladinAPIResolver
]

const startApolloServer = async () => {
  const server: ApolloServer<DataSourceContext> = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 8080 },
    context: async () => {
      return {
        dataSources: {
          aladinAPI: new AladinAPI(),
        },
      };
    },
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
};

startApolloServer();
