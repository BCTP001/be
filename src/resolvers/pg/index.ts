import { Resolvers } from "../../types/generated";
import { userResolvers } from "./user";
import { reviewResolvers } from "./review";

export const pgResolvers: Resolvers = {
  Query: {
    ...userResolvers.Query,
    ...reviewResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...reviewResolvers.Mutation,
  },
};
