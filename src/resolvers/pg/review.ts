import type {
  Id,
  Isbn,
  Review,
  InsertReviewArgs,
  UpdateReviewArgs,
} from "../../types/interface/pg-api";
import { type Resolvers } from "../../types/generated";
import { DataSourceContext } from "../../context";

export const userResolvers: Resolvers = {
  Query: {
    reviews: async (
      _,
      { isbn }: { isbn: Isbn },
      { dataSources }: DataSourceContext,
    ): Promise<Review[]> => {
      return await dataSources.pgAPI.searchReviewsByBook(isbn);
    },
    review: async (
      _,
      { id }: { id: Id },
      { dataSources }: DataSourceContext,
    ): Promise<Review> => {
      return await dataSources.pgAPI.lookupReview(id);
    },
  },
  Mutation: {
    createReview: async (
      _,
      { createReviewArgs }: { createReviewArgs: InsertReviewArgs },
      { dataSources }: DataSourceContext,
    ): Promise<Id> => {
      return await dataSources.pgAPI.insertReview(createReviewArgs);
    },
    updateReview: async (
      _,
      { updateReviewArgs }: { updateReviewArgs: UpdateReviewArgs },
      { dataSources }: DataSourceContext,
    ): Promise<Id> => {
      return await dataSources.pgAPI.updateReview(updateReviewArgs);
    },
    deleteReview: async (
      _,
      { id }: { id: Id },
      { dataSources }: DataSourceContext,
    ): Promise<Id> => {
      return await dataSources.pgAPI.deleteReview(id);
    },
  },
};
