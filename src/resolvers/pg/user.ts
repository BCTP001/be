/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User, Id, Username, Name } from "../../types/interface/pg-api";
import { type Resolvers } from "../../types/generated";
import { DataSourceContext } from "../../context";

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
  },
};
