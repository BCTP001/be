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

    async booksByLibrary(_, { libraryId }, { dataSources, userId }) {
      try {
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

        const foundLibrary = await dataSources.db.library.selectById(
          dataSources.db.db.query,
          libraryId,
        );

        if (!foundLibrary) {
          throw new GraphQLError("Library not found. libraryId is not vaild");
        }

        const rows = await dataSources.db.library.getIsbnBylibraryId(
          dataSources.db.db.query,
          libraryId,
        );
        const isbnList = rows.map((row) => row.isbn);

        const bookInfoPromiseObjList: Promise<GetBookInfoItem>[] = [];

        isbnList.map((value) => {
          bookInfoPromiseObjList.push(dataSources.aladin.getBookInfo(value));
        });

        const bookInfoObjList: GetBookInfoItem[] = await Promise.all(
          bookInfoPromiseObjList,
        );

        return bookInfoObjList;
      } catch (err) {
        console.log(err);
        throw new GraphQLError(err);
      }
    },

    async getRequestsOfBooksInLibrary(
      _,
      { libraryId },
      { dataSources, userId },
    ) {
      try {
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

        const foundLibrary = await dataSources.db.library.selectById(
          dataSources.db.db.query,
          libraryId,
        );

        if (!foundLibrary) {
          throw new GraphQLError("Library not found. libraryId is not vaild");
        }

        // const authority = await dataSources.db.library.getAuthorityOfUser(
        //   dataSources.db.db.query,
        //   userId,
        //   libraryId,
        // );

        // if (authority === null || authority > 1) {
        //   throw new GraphQLError(
        //     "Only owner or manager can access this resource.",
        //   );
        // }

        const requests = await dataSources.db.library.selectRequestsByLibraryId(
          dataSources.db.db.query,
          libraryId,
        );

        return requests;
      } catch (err) {
        console.log(err);
        throw new GraphQLError(err);
      }
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

    async handleRequestInLibrary(_, { request }, { dataSources, userId }) {
      try {
        if (userId === null) {
          throw new GraphQLError(
            "You cannot handle Request In Library when you're not signed in",
            {
              extensions: {
                code: "FORBIDDEN",
              },
            },
          );
        }
        const { requestId, newStatus } = request;

        const requestItem = await dataSources.db.library.selectByRequestId(
          dataSources.db.db.query,
          requestId,
        );
        if (!requestItem) {
          throw new GraphQLError("Request not found.");
        }

        if (requestItem.status === "A" || requestItem.status === "R") {
          throw new GraphQLError("이미 처리된 요청입니다.");
        }

        // const authority = await dataSources.db.library.getAuthorityOfUser(
        //   dataSources.db.db.query,
        //   userId,
        //   libraryId,
        // );

        // if (authority === null || authority > 1) {
        //   throw new GraphQLError(
        //     "Only owner or manager can access this resource.",
        //   );
        // }

        await dataSources.db.library.updateStatus(
          dataSources.db.db.write,
          requestId,
          newStatus,
        );

        return {
          msg: "도서 요청/폐기 처리가 성공적으로 처리되었습니다.",
        };
      } catch (err) {
        console.log(err);
        throw new GraphQLError(err);
      }
    },
  },
};
