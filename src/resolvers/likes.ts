/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLError } from "graphql";
import { Context } from "@interface/context";
import { type Resolvers } from "@generated";
import type {
    UpdateLikeBooksRequest,
    UpdateLikeBooksResponse
  } from "@interface/db";

export const likesResolvers: Resolvers = {
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

                await Promise.all(
                  newBooks.map((isbn13) => dataSources.db.insertBook(isbn13)),
                );
                
                if (request.containList.length) 
                    dataSources.db.insertLikes(userId, request.containList);

                if (request.excludeList.length)
                    dataSources.db.deleteLikes(userId, request.excludeList);
        
                return {
                  msg: "LikeBooks Update Success!!"
                };
              } catch (err) {
                throw new GraphQLError(err);
              }
            }
    }
}