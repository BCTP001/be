/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  User,
  Int,
  Username,
  Password,
  Name,
  WelcomePackage,
} from "@interface/to-be-deprecated";
import { type Resolvers } from "@generated";
import { Context } from "@interface/context";
import { hashPw, isPasswordSecure, setCookie } from "@utils";
import { GraphQLError } from "graphql";

export const userResolvers: Resolvers = {
  Query: {
    user: async (
      _: any,
      { id }: { id: Int },
      { dataSources }: Context,
    ): Promise<User> => {
      return await dataSources.db.user.findUserById(
        dataSources.db.db.query,
        id,
      );
    },
    users: async (
      _: any,
      __: any,
      { dataSources }: Context,
    ): Promise<User[]> => {
      return await dataSources.db.user.findAllUsers(dataSources.db.db.query);
    },
  },
  Mutation: {
    signUp: async (
      _: any,
      {
        username,
        password,
        name,
      }: { username: Username; password: Password; name: Name },
      { userId, dataSources }: Context,
    ): Promise<User> => {
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
    signIn: async (
      _: any,
      { username, password }: { username: Username; password: Password },
      { userId, dataSources, cookies }: Context,
    ): Promise<WelcomePackage> => {
      if (userId !== null) {
        throw new GraphQLError("You cannot sign in when you're signed in.", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }

      const welcomePackage = await dataSources.db.user.getWelcomePackage(
        dataSources.db.db.query,
        username,
        password,
      );
      setCookie(cookies, String(welcomePackage.signedInAs.id));

      return welcomePackage;
    },
    signOut: async (
      _: any,
      __: any,
      { userId, cookies }: Context,
    ): Promise<void> => {
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
