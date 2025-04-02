import type {
  SearchOption,
  GetBookInfoRequest,
  GetBookInfoItem,
  RecommendBookIsbnObject,
  RecommendBookListRequest,
} from "@interface/aladin";
import { type Resolvers } from "@generated";
import { Context } from "@interface/context";
import { GraphQLError } from "graphql";

export const aladinResolvers: Resolvers = {
  Query: {
    searchBooksAndGetBookInfo: async (
      _source: undefined,
      { searchOption }: { searchOption: SearchOption },
      { dataSources }: Context,
    ) => {
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
        throw new GraphQLError(err);
      }
    },

    getBookInfo: async (
      _source: undefined,
      { getBookInfoRequest }: { getBookInfoRequest: GetBookInfoRequest },
      { dataSources }: Context,
    ) => {
      try {
        if (!getBookInfoRequest || !getBookInfoRequest.isbn13) {
          throw new GraphQLError("itemId is required");
        }

        const bookInfo: GetBookInfoItem = await dataSources.aladin.getBookInfo(
          getBookInfoRequest.isbn13,
        );

        return bookInfo;
      } catch (err) {
        throw new GraphQLError(err);
      }
    },

    getRecommendBookList: async (
      _source: undefined,
      { request }: { request: RecommendBookListRequest },
      { dataSources }: Context,
    ) => {
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
        throw new GraphQLError(err);
      }
    },
  },
};
