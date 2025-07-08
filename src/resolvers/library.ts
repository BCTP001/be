import { libraryWithAuthorityIntoGql } from "@interface/db/library";
import { MutationResolvers, QueryResolvers, Resolvers } from "@generated";
import {
  ID as GqlID,
  String as GqlString,
  LibraryWithAuthority as GqlLibraryWithAuthority,
} from "@interface/graphql";
import { Context } from "@interface/context";
import { GraphQLError } from "graphql";

const Query: QueryResolvers = {
  librariesByUser: async (
    _,
    __,
    { dataSources, userId }: Context,
  ): Promise<GqlLibraryWithAuthority[]> => {
    if (userId === null) {
      throw new GraphQLError(
        "You cannot search for information when you're not signed in",
        {
          extensions: {
            code: "FORBIDDEN"
          },
        },
      );
    }
    const libraries = await dataSources.db.library.selectByUser(
      dataSources.db.db.query,
      Number(userId),
    );
    const res: GqlLibraryWithAuthority[] = [];
    for (const library of libraries) {
      res.push(libraryWithAuthorityIntoGql(library));
    }  
    return res;
  },
};

const Mutation: MutationResolvers = {
  createLibrary: async (
    _,
    args: { name: GqlString },
    { dataSources, userId }: Context,
  ): Promise<GqlID> => {
    if (userId === null) {
      throw new GraphQLError(
        "You cannot create a library when you're not signed in",
        {
          extensions: {
            code: "FORBIDDEN"
          },
        },
      );
    }
    const trx = await dataSources.db.db.write.transaction();
    const id = await dataSources.db.library.create(trx, args.name);
    await dataSources.db.library.assignOwnership(
      trx,
      id,
      Number(userId),
    );
    await trx.commit();
    return String(id);
  },
};

export const libraryResolvers: Resolvers = {
  Query,
  Mutation,
};
