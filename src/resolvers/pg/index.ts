import { Resolvers } from "@generated";
import { userResolvers } from "./user";
import { reviewResolvers } from "./review";
import { feedResolvers } from "./feed";
import { shelfResolvers } from "./shelf";

export const pgResolvers: Resolvers = {
  Query: {
    ...userResolvers.Query,
    ...reviewResolvers.Query,
    ...feedResolvers.Query,
    ...shelfResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...shelfResolvers.Mutation,
  },
};
