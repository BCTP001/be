/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLError } from "graphql";
import { Context } from "@interface/context";
import { type Resolvers } from "@generated";
import type {
  BookSchema,
  UpdateLikeBooksRequest,
  UpdateLikeBooksResponse,
} from "@interface/to-be-deprecated";
import { GetBookInfoItem } from "@interface/aladin";

export const likesResolvers: Resolvers = {
  Query: {
    getLikeBooks: async (
      _: any,
      __: any,
      { dataSources, userId }: Context,
    ): Promise<BookSchema[]> => {
      try {
        if (!userId) {
          throw new GraphQLError(
            "You can get LikeBooks when you're signed in.",
            {
              extensions: {
                code: "FORBIDDEN",
              },
            },
          );
        }

        const isbn13List: { isbn: string }[] =
          await dataSources.db.getLikeBooks(userId);

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
    updateLikeBooks: async (
      _: any,
      { request }: { request: UpdateLikeBooksRequest },
      { dataSources, userId }: Context,
    ): Promise<UpdateLikeBooksResponse> => {
      try {
        if (!userId) {
          throw new GraphQLError(
            "You can update LikeBooks when you're signed in.",
            {
              extensions: {
                code: "FORBIDDEN",
              },
            },
          );
        }

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

        if (request.containList.length)
          dataSources.db.insertLikes(userId, request.containList);

        if (request.excludeList.length)
          dataSources.db.deleteLikes(userId, request.excludeList);

        return {
          msg: "LikeBooks Update Success!!",
        };
      } catch (err) {
        throw new GraphQLError(err);
      }
    },
  },
};
