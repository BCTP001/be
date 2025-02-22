/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  User,
  Id,
  Username,
  Password,
  Name,
  WelcomePackage,
} from "../../types/interface/pg-api";
import { type Resolvers } from "../../types/generated";
import { DataSourceContext } from "../../context";
import { hashPw, isPasswordSecure } from "../../utils";
import { GraphQLError } from "graphql";

export const userResolvers: Resolvers = {
  Query: {
    user: async (
      _: any,
      { id }: { id: Id },
      { dataSources }: DataSourceContext,
    ): Promise<User> => {
      return await dataSources.pgAPI.findUserById(id);
    },
    users: async (
      _: any,
      __: any,
      { dataSources }: DataSourceContext,
    ): Promise<User[]> => {
      return await dataSources.pgAPI.findAllUsers();
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      { username, name }: { username: Username; name: Name },
      { dataSources }: DataSourceContext,
    ): Promise<User> => {
      return await dataSources.pgAPI.insertUser(username, name);
    },
    signUp: async (
      _: any,
      {
        username,
        password,
        name,
      }: { username: Username; password: Password; name: Name },
      { userId, dataSources }: DataSourceContext,
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
      return await dataSources.pgAPI.createUser(name, username, hashedPw);
    },
    signIn: async (
      _: any,
      { username, password }: { username: Username; password: Password },
      { userId, dataSources }: DataSourceContext,
    ): Promise<WelcomePackage> => {
      if (userId !== null) {
        throw new GraphQLError("You cannot sign in when you're signed in.", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }
      return await dataSources.pgAPI.getWelcomePackage(username, password);
    },
  },
};
