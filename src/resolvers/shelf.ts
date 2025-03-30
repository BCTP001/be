/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLError } from "graphql";
import { Context } from "@interface/context";
import { type Resolvers } from "@generated";
import type {
  BookSchema,
  CreateShelfRequest,
  CreateShelfResponse,
  UpdateShelfRequest,
  UpdateShelfResponse,
  getBooksInShelfRequest,
} from "@interface/db";
import { type GetBookInfoItem } from "@interface/aladin";

export const shelfResolvers: Resolvers = {
  Query: {
    getBooksInShelf: async (
      _: any,
      { request }: { request: getBooksInShelfRequest },
      { dataSources }: Context,
    ): Promise<GetBookInfoItem[]> => {
      try {
        const isbn13List: { isbn: string }[] =
          await dataSources.db.getBooksInShelf(request.shelfName);

        const bookInfoList: Promise<GetBookInfoItem>[] = [];

        isbn13List.map((value) => {
          bookInfoList.push(dataSources.aladin.getBookInfo(value.isbn));
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
      { dataSources, userId }: Context,
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

        dataSources.db.createShelf(userId, request.shelfName);

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
      { dataSources }: Context,
    ): Promise<UpdateShelfResponse> => {
      try {
        const existingBooks = await dataSources.db.getExistingBooks([
          ...request.containList,
          ...request.excludeList,
        ]);

        const newBooks = request.containList.filter(
          (isbn13) => !existingBooks.includes(isbn13),
        );

        const bookInfoPromiseObjList: Promise<GetBookInfoItem>[] = [];

        newBooks.map((value) => {
          bookInfoPromiseObjList.push(dataSources.aladin.getBookInfo(value));
        });

        const bookInfoObjList: GetBookInfoItem[] = await Promise.all(
          bookInfoPromiseObjList,
        );

        const bookInfoList: BookSchema[] = bookInfoObjList.map((item) => ({
          isbn: item.isbn13,
          title: item.title,
          link: item.link,
          author: item.author,
          pubDate: item.pubDate,
          description: item.description,
          creator: item.creator,
          cover: item.cover,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          publisher: item.publisher,
          customerReviewRank: item.customerReviewRank,
        }));

        await Promise.all(
          bookInfoList.map((bookInfoItem) =>
            dataSources.db.insertBook(bookInfoItem),
          ),
        );

        const shelfInfo = await dataSources.db.getShelfInfo(request.shelfName);

        await Promise.all(
          request.containList.map((isbn13) =>
            dataSources.db.insertContains(shelfInfo.id, isbn13),
          ),
        );

        const removableBooks = request.excludeList.filter((isbn13) =>
          existingBooks.includes(isbn13),
        );

        await Promise.all(
          removableBooks.map((isbn13) => dataSources.db.deleteContains(isbn13)),
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
