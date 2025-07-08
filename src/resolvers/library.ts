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
    args: { id: GqlID },
    { dataSources }: Context,
  ): Promise<GqlLibraryWithAuthority[]> => {
    const userId: number = Number(args.id);
    const libraries = await dataSources.db.library.selectByUser(
      dataSources.db,
      userId,
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
    const id = await dataSources.db.library.create(dataSources.db, args.name);
    await dataSources.db.library.assignOwnership(
      dataSources.db,
      id,
      Number(userId),
    );
    return String(id);
  },
};

export const libraryResolvers: Resolvers = {
  Query,
  Mutation,
};
