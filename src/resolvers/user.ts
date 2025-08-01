import { GraphQLError } from "graphql";
import { Resolvers } from "@generated";
import { hashPw, isPasswordSecure, setCookie } from "@utils";

export const userResolvers: Resolvers = {
  Query: {
    async user(_, { id }, { dataSources }) {
      return await dataSources.db.user.findUserById(
        dataSources.db.db.query,
        id,
      );
    },
    async users(_, __, { dataSources }) {
      return await dataSources.db.user.findAllUsers(dataSources.db.db.query);
    },
  },
  Mutation: {
    async signUp(_, { username, password, name }, { userId, dataSources }) {
      if (userId !== null) {
        throw new GraphQLError("You cannot sign up when you're signed in.", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }
      if (!isPasswordSecure(password)) {
        throw new GraphQLError("The password is not secure enough.", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }
      // Downside: Hashing operation runs even if the username already exists.
      const hashedPw = await hashPw(password);
      return await dataSources.db.user.createUser(
        dataSources.db.db.query,
        name,
        username,
        hashedPw,
      );
    },
    async signIn(_, { username, password }, { userId, dataSources, cookies }) {
      if (userId !== null) {
        throw new GraphQLError("You cannot sign in when you're signed in.", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }

      const user = await dataSources.db.user.getIfPasses(
        dataSources.db.db.query,
        username,
        password,
      );
      setCookie(cookies, String(user.id));

      return {
        signedInAs: user,
      };
    },
    async signOut(_, __, { userId, cookies }) {
      if (userId === null) {
        throw new GraphQLError(
          "You cannot sign out when you're not signed in",
          {
            extensions: {
              code: "FORBIDDEN",
            },
          },
        );
      }

      cookies.set("bctp_token", null);
    },
  },
};
