import type {
  SearchOption,
  GetBookInfoRequest,
  GetBookInfoItem,
  RecommendBookIsbnObject,
  RecommendBookListResponse,
} from "../types/interface/aladinAPI";
import { type Resolvers } from "../types/generated";
import { DataSourceContext } from "../context";

export const resolvers: Resolvers = {
  Query: {
    searchBooksAndGetBookInfo: async (
      _source: undefined,
      { searchOption }: { searchOption: SearchOption },
      { dataSources }: DataSourceContext,
    ) => {
      try {
        if (!searchOption || !searchOption.searchQuery) {
          throw new Error("searchQuery is required");
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
        throw new Error("Failed to fetch books from Aladin API");
      }
    },

    getBookInfo: async (
      _source: undefined,
      { getBookInfoRequest }: { getBookInfoRequest: GetBookInfoRequest },
      { dataSources }: DataSourceContext,
    ) => {
      try {
        if (!getBookInfoRequest || !getBookInfoRequest.isbn13) {
          throw new Error("itemId is required");
        }

        const bookInfo: GetBookInfoItem =
          await dataSources.aladinAPI.getBookInfo(getBookInfoRequest.isbn13);

        return bookInfo;
      } catch (err) {
        console.log(err);
        throw new Error("Failed to fetch books from Aladin API");
      }
    },

    getRecommendBookList: async (
      _source: undefined,
      __: undefined,
      { dataSources }: DataSourceContext,
    ) => {
      try {
        const recommendBookList: RecommendBookIsbnObject =
          await dataSources.aladinAPI.getRecommendBookList();

        const bookInfoList: Promise<GetBookInfoItem>[] = [];

        for (const i of recommendBookList.isbn13List) {
          const bookInfo: Promise<GetBookInfoItem> =
            dataSources.aladinAPI.getBookInfo(i);
          bookInfoList.push(bookInfo);
        }

        const response: RecommendBookListResponse = {
          queryType: recommendBookList.queryType,
          data: await Promise.all(bookInfoList),
        };

        return response;
      } catch (err) {
        console.log(err);
        throw new Error("Failed to fetch books from Aladin API");
      }
    },
  },
};
