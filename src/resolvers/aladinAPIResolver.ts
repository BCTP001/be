import type {
  SearchOption,
  GetBookInfoRequest,
  GetBookInfoItem,
  RecommendBookIsbnObject,
  RecommendBookListRequest,
} from "../types/interface/aladinAPI";
import { type Resolvers } from "../types/generated";
import { DataSourceContext } from "../context";
import { GraphQLError } from "graphql";

export const aladinAPIResolver: Resolvers = {
  Query: {
    searchBooksAndGetBookInfo: async (
      _source: undefined,
      { searchOption }: { searchOption: SearchOption },
      { dataSources }: DataSourceContext,
    ) => {
      try {
        if (!searchOption || !searchOption.searchQuery) {
          throw new GraphQLError("searchQuery is required");
        }

        const bookIsbn13List: string[] =
          await dataSources.aladinAPI.getBookIsbn13List(searchOption);

        const response: Promise<GetBookInfoItem>[] = [];

        for (const i of bookIsbn13List) {
          const bookInfo: Promise<GetBookInfoItem> =
            dataSources.aladinAPI.getBookInfo(i);
          response.push(bookInfo);
        }

        return await Promise.all(response);
      } catch (err) {
        console.log(err);
        throw new GraphQLError(err);
      }
    },

    getBookInfo: async (
      _source: undefined,
      { getBookInfoRequest }: { getBookInfoRequest: GetBookInfoRequest },
      { dataSources }: DataSourceContext,
    ) => {
      try {
        if (!getBookInfoRequest || !getBookInfoRequest.isbn13) {
          throw new GraphQLError("itemId is required");
        }

        const bookInfo: GetBookInfoItem =
          await dataSources.aladinAPI.getBookInfo(getBookInfoRequest.isbn13);

        return bookInfo;
      } catch (err) {
        console.log(err);
        throw new GraphQLError(err);
      }
    },

    getRecommendBookList: async (
      _source: undefined,
      { request }: { request: RecommendBookListRequest },
      { dataSources }: DataSourceContext,
    ) => {
      try {
        if (!request || !request.queryType) {
          throw new GraphQLError("queryType is required");
        }

        const recommendBookList: RecommendBookIsbnObject =
          await dataSources.aladinAPI.getRecommendBookList(request.queryType);

        const bookInfoList: Promise<GetBookInfoItem>[] = [];

        for (const i of recommendBookList.isbn13List) {
          bookInfoList.push(dataSources.aladinAPI.getBookInfo(i));
        }

        return await Promise.all(bookInfoList);
      } catch (err) {
        console.log(err);
        throw new GraphQLError(err);
      }
    },
  },
};
