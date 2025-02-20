import path from "path";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { aladinAPIResolver } from "./resolvers/aladinAPIResolver";
import { pgResolvers } from "./resolvers/pg";
import { AladinAPI } from "./datasources/aladinAPI";
import { DataSourceContext } from "./context";
import { readFileSync } from "fs";
import { gql } from "graphql-tag";
import { DocumentNode } from "graphql";
import { PGAPI } from "./datasources/pg-api";
import knexConfig from "./knex";

const typeDefs: DocumentNode = gql(
  readFileSync(path.resolve(__dirname, "../src/schema.graphql"), {
    encoding: "utf-8",
  }),
);

const resolvers = [aladinAPIResolver, pgResolvers];

const startApolloServer = async () => {
  const server: ApolloServer<DataSourceContext> = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => {
      const { cache } = server;
      return {
        dataSources: {
          aladinAPI: new AladinAPI(),
          pgAPI: new PGAPI({ cache, knexConfig }),
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
