/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLError } from "graphql";
import { DataSourceContext } from "../../context";
import { type Resolvers } from "../../types/generated";
import type {
  CreateShelfRequest,
  CreateShelfResponse,
  UpdateShelfRequest,
  UpdateShelfResponse,
  getBooksInShelfRequest,
} from "../../types/interface/pg-api";
import { type GetBookInfoItem } from "../../types/interface/aladinAPI";

export const shelfResolvers: Resolvers = {
  Query: {
    getBooksInShelf: async (
      _: any,
      { request }: { request: getBooksInShelfRequest },
      { dataSources }: DataSourceContext,
    ): Promise<GetBookInfoItem[]> => {
      try {
        const isbn13List: { isbn: string }[] =
          await dataSources.pgAPI.getBooksInShelf(request.shelfName);

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
    createShelf: async (
      _: any,
      { request }: { request: CreateShelfRequest },
      { dataSources, userId }: DataSourceContext,
    ): Promise<CreateShelfResponse> => {
      try {
        if (!userId) {
          throw new GraphQLError(
            "You can create Shelf when you're signed in.",
            {
              extensions: {
                code: "FORBIDDEN",
              },
            },
          );
        }

        dataSources.pgAPI.createShelf(userId, request.shelfName);

        return {
          msg: `${request.shelfName} Shelf Create Success!!`,
        };
      } catch (err) {
        throw new GraphQLError(err);
      }
    },

    updateShelf: async (
      _: any,
      { request }: { request: UpdateShelfRequest },
      { dataSources }: DataSourceContext,
    ): Promise<UpdateShelfResponse> => {
      try {
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

        const shelfInfo = await dataSources.pgAPI.getShelfInfo(
          request.shelfName,
        );

        await Promise.all(
          request.containList.map((isbn13) =>
            dataSources.pgAPI.insertContains(shelfInfo.id, isbn13),
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
          shelfName: shelfInfo.name,
        };
      } catch (err) {
        throw new GraphQLError(err);
      }
    },
  },
};
