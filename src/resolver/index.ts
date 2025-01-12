import { Resolvers } from "../types/generated";

export const resolvers: Resolvers = {
  Query: {
    placeholder: (_, __, { dataSources }) => {
      return dataSources.mySQLAPI.getPlaceholder();
    }
  }
}
