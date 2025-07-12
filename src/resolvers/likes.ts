import { GraphQLError } from "graphql";
import { Resolvers } from "@generated";
import { GetBookInfoItem } from "@interface/aladin";
import { Book } from "@interface/db";

export const likesResolvers: Resolvers = {
  Query: {
    async getLikeBooks(_, __, { dataSources, userId }) {
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

        const isbns: string[] = await dataSources.db.like.getLikeBooks(
          dataSources.db.db.query,
          userId,
        );

        return await Promise.all(
          isbns.map((isbn) => dataSources.aladin.getBookInfo(isbn)),
        );
      } catch (err) {
        throw new GraphQLError(err);
      }
    },
  },

  Mutation: {
    async updateLikeBooks(_, { request }, { dataSources, userId }) {
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

        const existingBooks = await dataSources.db.book.getExistingBooks(
          dataSources.db.db.query,
          [...request.containList, ...request.excludeList],
        );

        const newBooks = request.containList.filter(
          (isbn13) => !existingBooks.includes(isbn13),
        );

        const bookInfoObjList: GetBookInfoItem[] = await Promise.all(
          newBooks.map((value) => dataSources.aladin.getBookInfo(value)),
        );

        const bookInfoList: Book[] = bookInfoObjList.map((item) => ({
          isbn: item.isbn13,
          title: item.title,
          link: item.link,
          author: item.author,
          pubDate: new Date(item.pubDate),
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
            dataSources.db.book.insertBook(
              dataSources.db.db.write,
              bookInfoItem,
            ),
          ),
        );

        if (request.containList.length)
          dataSources.db.like.insertLikes(
            dataSources.db.db.write,
            userId,
            request.containList,
          );

        if (request.excludeList.length)
          dataSources.db.like.deleteLikes(
            dataSources.db.db.write,
            userId,
            request.excludeList,
          );

        return {
          msg: "LikeBooks Update Success!!",
        };
      } catch (err) {
        throw new GraphQLError(err);
      }
    },
  },
};
