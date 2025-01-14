import type { SearchOption }from "../types/interface/aladinAPI";
import { type Resolvers } from '../types/generated';
import { DataSourceContext } from "../context";

export const resolvers: Resolvers = {
    Query: {

      searchBooks: async (_source: any, { searchOption }: { searchOption: SearchOption }, { dataSources }: DataSourceContext) => {
        if (!searchOption || !searchOption.searchQuery) {
          throw new Error("searchQuery is required");
        }
        const books = await dataSources.aladinAPI.searchBooks(searchOption);
        return books;
      }
    },
  };