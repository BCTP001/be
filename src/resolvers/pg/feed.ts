/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataSourceContext } from "../../context";
import { type Resolvers } from "../../types/generated";
import { type Feed } from "../../types/interface/pg-api";

export const feedResolvers: Resolvers = {
  Query: {
    getFeed: async (
      _: any,
      __: any,
      { dataSources }: DataSourceContext,
    ): Promise<Feed[]> => {
      const pgData = await dataSources.pgAPI.getFeed();

      const bookInfoList = await Promise.all(
        pgData.map(({ isbn13 }) => dataSources.aladinAPI.getBookInfo(isbn13)),
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
    },
  },
};
