/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLError } from "graphql";
import { DataSourceContext } from "../../context";
import { type Resolvers } from "../../types/generated";
import type {
  UpdateShelfRequest,
  UpdateShelfResponse,
  UserId,
} from "../../types/interface/pg-api";
import { type GetBookInfoItem } from "../../types/interface/aladinAPI";

export const shelfResolver: Resolvers = {
  Query: {
    getBooksInShelf: async (
      _: any,
      { request }: { request: UserId },
      { dataSources }: DataSourceContext,
    ): Promise<GetBookInfoItem[]> => {
      try {
        const isbn13List: { isbn: string }[] =
          await dataSources.pgAPI.getBooksInShelf(request.userId);

        const bookInfoList: Promise<GetBookInfoItem>[] = [];

        isbn13List.map((value) => {
          bookInfoList.push(dataSources.aladinAPI.getBookInfo(value.isbn));
        });

        return await Promise.all(bookInfoList);
      } catch (err) {
        throw new GraphQLError(err);
      }
    },
  },
  Mutation: {
    updateShelf: async (
      _: any,
      { request }: { request: UpdateShelfRequest },
      { dataSources }: DataSourceContext,
    ): Promise<UpdateShelfResponse> => {
      try {
        console.log(request);
        const existingBooks = await dataSources.pgAPI.getExistingBooks([
          ...request.containList,
          ...request.excludeList,
        ]);

        const newBooks = request.containList.filter(
          (isbn13) => !existingBooks.includes(isbn13),
        );

        await Promise.all(
          newBooks.map((isbn13) => dataSources.pgAPI.insertBook(isbn13)),
        );

        const shelfNames = await Promise.all(
          request.containList.map((isbn13) =>
            dataSources.pgAPI.insertContains(request.userId, isbn13),
          ),
        );

        const removableBooks = request.excludeList.filter((isbn13) =>
          existingBooks.includes(isbn13),
        );

        await Promise.all(
          removableBooks.map((isbn13) =>
            dataSources.pgAPI.deleteContains(isbn13),
          ),
        );

        return {
          msg: "Shelf Update Success!!",
          shelfName: shelfNames[0],
        };
      } catch (err) {
        throw new GraphQLError(err);
      }
    },
  },
};
