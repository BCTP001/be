/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  User,
  Id,
  Username,
  Password,
  Name,
  WelcomePackage,
} from "@interface/db";
import { type Resolvers } from "@generated";
import { Context } from "@interface/context";
import { hashPw, isPasswordSecure, setCookie } from "@utils";
import { GraphQLError } from "graphql";

export const userResolvers: Resolvers = {
  Query: {
    user: async (
      _: any,
      { id }: { id: Id },
      { dataSources }: Context,
    ): Promise<User> => {
      return await dataSources.db.findUserById(id);
    },
    users: async (
      _: any,
      __: any,
      { dataSources }: Context,
    ): Promise<User[]> => {
      return await dataSources.db.findAllUsers();
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      { username, name }: { username: Username; name: Name },
      { dataSources }: Context,
    ): Promise<User> => {
      return await dataSources.db.insertUser(username, name);
    },
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
      return await dataSources.db.createUser(name, username, hashedPw);
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

      const welcomePackage = await dataSources.db.getWelcomePackage(
        username,
        password,
      );
      setCookie(cookies, welcomePackage.signedInAs.id);
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
