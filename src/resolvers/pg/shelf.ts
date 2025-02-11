/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLError } from "graphql";
import { DataSourceContext } from "../../context";
import { type Resolvers } from "../../types/generated";
import type {
  ContainBookInShelfRequest,
  ContainBookInShelfResponse,
  ShelfId,
} from "../../types/interface/pg-api";
import { type GetBookInfoItem } from "../../types/interface/aladinAPI";

export const shelfResolver: Resolvers = {
  Query: {
    getBooksInShelf: async (
      _: any,
      { request }: { request: ShelfId },
      { dataSources }: DataSourceContext,
    ): Promise<GetBookInfoItem[]> => {
      try {
        const isbn13List: { isbn: string }[] =
          await dataSources.pgAPI.getBooksInShelf(request.shelfId);

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
    containBookInShelf: async (
      _: any,
      { request }: { request: ContainBookInShelfRequest },
      { dataSources }: DataSourceContext,
    ): Promise<ContainBookInShelfResponse> => {
      try {
        const existingBooks = await dataSources.pgAPI.getExistingBooks(
          request.isbn13List,
        );

        const newBooks = request.isbn13List.filter(
          (isbn13) => !existingBooks.includes(isbn13),
        );

        await Promise.all(
          newBooks.map((isbn13) => dataSources.pgAPI.insertBook(isbn13)),
        );

        const shelfNames = await Promise.all(
          request.isbn13List.map((isbn13) =>
            dataSources.pgAPI.insertContains(request.userId, isbn13),
          ),
        );

        return {
          msg: "Success!!",
          shelfName: shelfNames[0],
          isbn13List: request.isbn13List,
        };
      } catch (err) {
        throw new GraphQLError(err);
      }
    },
  },
};
