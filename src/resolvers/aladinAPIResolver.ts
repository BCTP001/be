import type { SearchText } from "../types/interface/aladinAPI";
import { type Resolvers } from '../types/generated';

export const resolvers: Resolvers = {
    Query: {
      searchBooks: async (_source: any, { query }: SearchText, { dataSources }) => {
        const searchText: SearchText = { query }
        const books = await dataSources.aladinAPI.searchBooks(searchText.query);
        return books;
      },
    },
  };