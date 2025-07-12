import { GraphQLError } from "graphql";
import { Resolvers } from "@generated";
import type {
  GetBookInfoItem,
  RecommendBookIsbnObject,
} from "@interface/aladin";

export const aladinResolvers: Resolvers = {
  Query: {
    async searchBooksAndGetBookInfo(_, { searchOption }, { dataSources }) {
      try {
        if (!searchOption || !searchOption.searchQuery) {
          throw new GraphQLError("searchQuery is required");
        }

        const bookIsbn13List: string[] =
          await dataSources.aladin.getBookIsbn13List(searchOption);

        const response: Promise<GetBookInfoItem>[] = [];

        bookIsbn13List.map((value) => {
          response.push(dataSources.aladin.getBookInfo(value));
        });

        return await Promise.all(response);
      } catch (err) {
        console.log(err);
        throw new GraphQLError(err);
      }
    },

    async getBookInfo(_, { getBookInfoRequest }, { dataSources }) {
      try {
        if (!getBookInfoRequest || !getBookInfoRequest.isbn13) {
          throw new GraphQLError("itemId is required");
        }

        const bookInfo: GetBookInfoItem = await dataSources.aladin.getBookInfo(
          getBookInfoRequest.isbn13,
        );

        return bookInfo;
      } catch (err) {
        console.log(err);
        throw new GraphQLError(err);
      }
    },

    async getRecommendBookList(_, { request }, { dataSources }) {
      try {
        if (!request || !request.queryType) {
          throw new GraphQLError("queryType is required");
        }

        const recommendBookList: RecommendBookIsbnObject =
          await dataSources.aladin.getRecommendBookList(request.queryType);

        const bookInfoList: Promise<GetBookInfoItem>[] =
          recommendBookList.isbn13List.map((isbn) =>
            dataSources.aladin.getBookInfo(isbn),
          );

        return await Promise.all(bookInfoList);
      } catch (err) {
        console.log(err);
        throw new GraphQLError(err);
      }
    },
  },
};
