import type { SearchOption } from "../types/interface/aladinAPI";
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
        const books = await dataSources.aladinAPI.searchBooks(searchOption);
        return books;
      } catch (err) {
        console.log(err);
        throw new Error("Failed to fetch books from Aladin API");
      }
    },
  },
};
