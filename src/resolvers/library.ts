import { GraphQLError } from "graphql";
import { Resolvers } from "@generated";
import { Authority } from "@interface/db";

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
    }
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
  },
};
