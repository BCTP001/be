import { GraphQLError } from "graphql";
import { Resolvers } from "@generated";
import { Authority, Book } from "@interface/db";
import { GetBookInfoItem } from "@interface/aladin";

export const libraryResolvers: Resolvers = {
  Query: {
    async librariesByUser(_, __, { dataSources, userId }) {
      if (userId === null) {
        throw new GraphQLError(
          "You cannot search for information when you're not signed in",
          {
            extensions: {
              code: "FORBIDDEN",
            },
          },
        );
      }
      return (
        await dataSources.db.library.selectByUser(
          dataSources.db.db.query,
          Number(userId),
        )
      ).map((library) => ({
        id: library.id,
        name: library.name,
        authority: Authority.intoGql(library.authority),
      }));
    },
    async usersByLibrary(_, args, { dataSources, userId }) {
      if (userId === null) {
        throw new GraphQLError(
          "You cannot search for information when you're not signed in",
          {
            extensions: {
              code: "FORBIDDEN",
            },
          },
        );
      }
      return (
        await dataSources.db.library.lookupMembers(
          dataSources.db.db.query,
          args.libraryId,
        )
      ).map((user_) => {
        const { authority, ...user } = user_;
        return {
          user,
          authority: Authority.intoGql(authority),
        };
      });
    },
    async librariesByBook(_, { isbn }, { dataSources, userId }) {
      if (userId === null) {
        throw new GraphQLError(
          "You cannot search for information when you're not signed in",
          {
            extensions: {
              code: "FORBIDDEN",
            },
          },
        );
      }
      return (
        await dataSources.db.library.selectByBook(
          dataSources.db.db.query,
          Number(userId),
          isbn,
        )
      ).map((library) => ({
        ...library,
        authority: Authority.intoGql(library.authority),
      }));
    },
  },

  Mutation: {
    async createLibrary(_, args, { dataSources, userId }) {
      if (userId === null) {
        throw new GraphQLError(
          "You cannot create a library when you're not signed in",
          {
            extensions: {
              code: "FORBIDDEN",
            },
          },
        );
      }
      const trx = await dataSources.db.db.write.transaction();
      const id = await dataSources.db.library.create(trx, args.name);
      await dataSources.db.library.assignOwnership(trx, id, Number(userId));
      await trx.commit();
      return id;
    },

    async requestBookInLibrary(_, { request }, { dataSources, userId }) {
      try {
        if (userId === null) {
          throw new GraphQLError(
            "You cannot request book in library when you're not signed in",
            {
              extensions: {
                code: "FORBIDDEN",
              },
            },
          );
        }
        // {
        //   "request": {
        //     "isbn": "9783140464079",
        //     "libraryId": 1,
        //     "type": "ADD",
        //   }
        // }
        const { isbn, libraryId, type } = request;
        const requestType = type;

        const isValidIsbn = typeof isbn === "string" && /^\d{13}$/.test(isbn);
        if (!isValidIsbn) {
          throw new GraphQLError("Invalid ISBN format. Must be 13 digits.");
        }

        const bookInfo: GetBookInfoItem =
          await dataSources.aladin.getBookInfo(isbn);

        const existingIsbns = await dataSources.db.book.getExistingBooks(
          dataSources.db.db.query,
          [isbn],
        );
        const trx = await dataSources.db.db.write.transaction();
        if (existingIsbns.length === 0) {
          const bookObject: Book = {
            isbn: bookInfo.isbn13,
            title: bookInfo.title,
            link: bookInfo.link,
            author: bookInfo.author,
            pubDate: new Date(bookInfo.pubDate),
            description: bookInfo.description,
            creator: bookInfo.creator,
            cover: bookInfo.cover,
            categoryId: bookInfo.categoryId,
            categoryName: bookInfo.categoryName,
            publisher: bookInfo.publisher,
            customerReviewRank: bookInfo.customerReviewRank,
          };
          await dataSources.db.book.insertBook(trx, bookObject);
        }

        const foundLibrary = await dataSources.db.library.selectById(
          dataSources.db.db.query,
          libraryId,
        );

        if (!foundLibrary) {
          throw new GraphQLError("Library not found. libraryId is not vaild");
        }

        if (!["ADD", "REMOVE"].includes(requestType)) {
          throw new GraphQLError(
            "Request type must be either 'ADD' or 'REMOVE'.",
          );
        }

        const isExists = await dataSources.db.library.existsBook(
          dataSources.db.db.query,
          libraryId,
          isbn,
        );

        if (requestType === "ADD" && isExists) {
          throw new GraphQLError("Book already exists in the library.");
        }

        if (requestType === "REMOVE" && !isExists) {
          throw new GraphQLError(
            "Cannot remove a book that is not in the library.",
          );
        }

        await dataSources.db.library.createRequest(trx, {
          isbn,
          libraryId,
          userId,
          requestType,
        });

        await trx.commit();

        return {
          msg: "성공적으로 도서관 책 구비/폐기 요청이 완료되었습니다.",
        };
      } catch (err) {
        console.log(err);
        throw new GraphQLError(err);
      }
    },
  },
};
