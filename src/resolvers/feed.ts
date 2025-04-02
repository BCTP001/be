/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLError } from "graphql";
import { Context } from "@interface/context";
import { type Resolvers } from "@generated";
import { PgFeedObject, type Feed } from "@interface/db";

export const feedResolvers: Resolvers = {
  Query: {
    getFeed: async (
      _: any,
      __: any,
      { dataSources }: Context,
    ): Promise<Feed[]> => {
      try {
        const pgData: PgFeedObject[] = await dataSources.db.getFeed();

        const bookInfoList = await Promise.all(
          pgData.map(({ isbn13 }) => dataSources.aladin.getBookInfo(isbn13)),
        );

        return pgData.map((data, index) => ({
          isbn13: data.isbn13,
          bookName: bookInfoList[index].title,
          bookDescription: bookInfoList[index].description,
          bookPhotoUrl: bookInfoList[index].cover,
          categoryName: bookInfoList[index].categoryName,
          author: bookInfoList[index].author,
          libraryName: data.libraryName,
          reviewContent: data.reviewContent,
          rating: data.rating,
        }));
      } catch (err) {
        throw new GraphQLError(err);
      }
    },
  },
};
