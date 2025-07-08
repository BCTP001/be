import type {
  Int,
  Isbn,
  Review,
  InsertReviewArgs,
  UpdateReviewArgs,
} from "@interface/to-be-deprecated";
import { QueryResolvers, type Resolvers } from "@generated";
import { Context } from "@interface/context";

const rr: QueryResolvers = {
  reviews: async (
    _,
    { isbn }: { isbn: Isbn },
    { dataSources }: Context,
  ): Promise<Review[]> => {
    return await dataSources.db.review.searchReviewsByBook(
      dataSources.db.db.query,
      isbn,
    );
  },
  review: async (
    _,
    { id }: { id: Int },
    { dataSources }: Context,
  ): Promise<Review> => {
    return await dataSources.db.review.lookupReview(
      dataSources.db.db.query,
      id,
    );
  },
};

export const reviewResolvers: Resolvers = {
  Query: rr,
  Mutation: {
    createReview: async (
      _,
      { createReviewArgs }: { createReviewArgs: InsertReviewArgs },
      { dataSources }: Context,
    ): Promise<Int> => {
      return await dataSources.db.review.insertReview(
        dataSources.db.db.write,
        createReviewArgs,
      );
    },
    updateReview: async (
      _,
      { updateReviewArgs }: { updateReviewArgs: UpdateReviewArgs },
      { dataSources }: Context,
    ): Promise<Int> => {
      return await dataSources.db.review.updateReview(
        dataSources.db.db.write,
        updateReviewArgs,
      );
    },
    deleteReview: async (
      _,
      { id }: { id: Int },
      { dataSources }: Context,
    ): Promise<Int> => {
      return await dataSources.db.review.deleteReview(
        dataSources.db.db.write,
        id,
      );
    },
  },
};
