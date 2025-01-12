import type { SearchText } from "../types/interface/aladinAPI";
import { type Resolvers } from '../types/generated';

export const resolvers: Resolvers = {
    Query: {
      searchBooks: async (_source: any, { query }: SearchText, { dataSources }) => {
        // ListingAPI에서 책 검색
        console.log("HI");
        const searchText: SearchText = {query}
        const books = await dataSources.aladinAPI.searchBooks(searchText.query);

        console.log(books);
        return books; // 반환된 책 목록
      },
    },
  };