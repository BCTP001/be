import { GraphQLError } from "graphql";
import { Resolvers } from "@generated";

export const feedResolvers: Resolvers = {
  Query: {
    async getFeed(_, __, { dataSources }) {
      try {
        const pgData = await dataSources.db.getFeed();

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
        console.log(err);
        throw new GraphQLError(err);
      }
    },
  },
};
