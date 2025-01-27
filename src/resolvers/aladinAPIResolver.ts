import type {
  SearchOption,
  GetBookInfoRequest,
  AladinAPIBookItem,
  GetBookInfoItem,
} from "../types/interface/aladinAPI";
import { type Resolvers } from "../types/generated";
import { DataSourceContext } from "../context";

export const resolvers: Resolvers = {
  Query: {
    searchBooks: async (
      _source: undefined,
      { searchOption }: { searchOption: SearchOption },
      { dataSources }: DataSourceContext,
    ) => {
      try {
        if (!searchOption || !searchOption.searchQuery) {
          throw new Error("searchQuery is required");
        }
        const books: AladinAPIBookItem[] =
          await dataSources.aladinAPI.searchBooks(searchOption);
        return books;
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
        const bookInfo: GetBookInfoItem[] =
          await dataSources.aladinAPI.getBookInfo(getBookInfoRequest.isbn13);
        console.log(bookInfo);
        return bookInfo;
      } catch (err) {
        console.log(err);
        throw new Error("Failed to fetch books from Aladin API");
      }
    },
  },
};
