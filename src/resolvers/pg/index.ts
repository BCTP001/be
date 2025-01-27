import { Resolvers } from "../../types/generated";
import { userResolvers } from "./user";

export const pgResolvers: Resolvers = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
};
