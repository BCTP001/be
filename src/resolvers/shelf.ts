import { GraphQLError } from "graphql";
import { Resolvers } from "@generated";
import { GetBookInfoItem } from "@interface/aladin";
import { Book } from "@interface/db";

export const shelfResolvers: Resolvers = {
  Query: {
    async getBooksInShelf(_, { request }, { dataSources }) {
      try {
        const isbn13List: string[] = await dataSources.db.shelf.getBooksInShelf(
          dataSources.db.db.query,
          request.shelfName,
        );

        return await Promise.all(
          isbn13List.map((isbn) => dataSources.aladin.getBookInfo(isbn)),
        );
      } catch (err) {
        throw new GraphQLError(err);
      }
    },
  },
  Mutation: {
    async createShelf(_, { request }, { dataSources }) {
      try {
        dataSources.db.shelf.createShelf(
          dataSources.db.db.write,
          request.userId,
          request.shelfName,
        );

        return {
          msg: `${request.shelfName} Shelf Create Success!!`,
        };
      } catch (err) {
        throw new GraphQLError(err);
      }
    },

    async updateShelf(_, { request }, { dataSources }) {
      try {
        const existingBooks = await dataSources.db.book.getExistingBooks(
          dataSources.db.db.query,
          [...request.containList],
        );

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

        const shelfInfo = await dataSources.db.shelf.getShelfInfo(
          dataSources.db.db.query,
          request.shelfName,
        );

        await Promise.all(
          request.containList.map((isbn13) =>
            dataSources.db.shelf.insertContains(
              dataSources.db.db.write,
              shelfInfo.id,
              isbn13,
            ),
          ),
        );

        const existingBooksInShelf = await dataSources.db.shelf.getBooksInShelf(
          dataSources.db.db.query,
          request.shelfName,
        );

        const removableBooks = request.excludeList.filter((isbn13) =>
          existingBooksInShelf.includes(isbn13),
        );

        await Promise.all(
          removableBooks.map((isbn13) =>
            dataSources.db.shelf.deleteContains(
              dataSources.db.db.write,
              isbn13,
            ),
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
