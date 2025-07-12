import path from "path";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { gql } from "graphql-tag";
import { readFileSync } from "fs";
import { DocumentNode } from "graphql";
import Cookies from "cookies";

import resolvers from "@resolvers";
import { Aladin } from "@datasources/aladin";
import { Context } from "@interface/context";
import { DB } from "@datasources/db";
import knexConfig from "@knex";
import { setCookie, verifyJWT } from "@utils";

const typeDefs: DocumentNode = gql(
  readFileSync(path.resolve(__dirname, "../src/schema.graphql"), {
    encoding: "utf-8",
  }),
);

const startApolloServer = async () => {
  const server: ApolloServer<Context> = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }): Promise<Context> => {
      const { cache } = server;

      let userId: string = null;

      const cookies = new Cookies(req, res);
      const token = cookies.get("bctp_token");
      if (token) {
        try {
          const data = verifyJWT(token);
          if (data.isExpSoon) {
            setCookie(cookies, data.userId);
          }
          userId = data.userId;
        } catch {
          cookies.set("bctp_token", null);
          userId = null;
        }
      }

      return {
        dataSources: {
          aladin: new Aladin(),
          db: new DB({ cache, knexConfig }),
        },
        userId: userId ? Number(userId) : null,
        cookies,
      };
    },
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
};

startApolloServer();
