import { Resolvers } from "@generated";

export const reviewResolvers: Resolvers = {
  Query: {
    async reviews(_, { isbn }, { dataSources }) {
      return await dataSources.db.review.searchReviewsByBook(
        dataSources.db.db.query,
        isbn,
      );
    },
    async review(_, { id }, { dataSources }) {
      return await dataSources.db.review.lookupReview(
        dataSources.db.db.query,
        id,
      );
    },
  },
  Mutation: {
    async createReview(_, { createReviewArgs }, { dataSources }) {
      return await dataSources.db.review.insertReview(
        dataSources.db.db.write,
        createReviewArgs,
      );
    },
    async updateReview(_, { updateReviewArgs }, { dataSources }) {
      return await dataSources.db.review.updateReview(
        dataSources.db.db.write,
        updateReviewArgs,
      );
    },
    async deleteReview(_, { id }, { dataSources }) {
      return await dataSources.db.review.deleteReview(
        dataSources.db.db.write,
        id,
      );
    },
  },
};
