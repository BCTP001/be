import type { User, Id, Username, Name } from "../../types/interface/pg-api";
import { type Resolvers } from "../../types/generated";
import { DataSourceContext } from "../../context";

export const userResolvers: Resolvers = {
  Query: {
    user: async (
      _,
      { id }: { id: Id },
      { dataSources }: DataSourceContext,
    ): Promise<User> => {
      return await dataSources.pgAPI.findUserById(id);
    },
    users: async (
      _,
      __,
      { dataSources }: DataSourceContext,
    ): Promise<User[]> => {
      return await dataSources.pgAPI.findAllUsers();
    },
  },
  Mutation: {
    createUser: async (
      _,
      { username, name }: { username: Username; name: Name },
      { dataSources }: DataSourceContext,
    ): Promise<User> => {
      return await dataSources.pgAPI.insertUser(username, name);
    },
  },
};
