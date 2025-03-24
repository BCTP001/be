import type {
  Id,
  Isbn,
  Review,
  InsertReviewArgs,
  UpdateReviewArgs,
} from "@interface/db";
import { QueryResolvers, type Resolvers } from "@generated";
import { Context } from "@interface/context";

const rr: QueryResolvers = {
  reviews: async (
    _,
    { isbn }: { isbn: Isbn },
    { dataSources }: Context,
  ): Promise<Review[]> => {
    return await dataSources.db.searchReviewsByBook(isbn);
  },
  review: async (
    _,
    { id }: { id: Id },
    { dataSources }: Context,
  ): Promise<Review> => {
    return await dataSources.db.lookupReview(id);
  },
};

export const reviewResolvers: Resolvers = {
  Query: rr,
  Mutation: {
    createReview: async (
      _,
      { createReviewArgs }: { createReviewArgs: InsertReviewArgs },
      { dataSources }: Context,
    ): Promise<Id> => {
      return await dataSources.db.insertReview(createReviewArgs);
    },
    updateReview: async (
      _,
      { updateReviewArgs }: { updateReviewArgs: UpdateReviewArgs },
      { dataSources }: Context,
    ): Promise<Id> => {
      return await dataSources.db.updateReview(updateReviewArgs);
    },
    deleteReview: async (
      _,
      { id }: { id: Id },
      { dataSources }: Context,
    ): Promise<Id> => {
      return await dataSources.db.deleteReview(id);
    },
  },
};
