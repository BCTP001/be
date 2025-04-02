/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLError } from "graphql";
import { Context } from "@interface/context";
import { GetBookInfoItem, type Resolvers } from "@generated";
import type {
  BookSchema,
  CreateArticleRequest,
  CreateArticleResponse,
} from "@interface/db";

export const articleResolvers: Resolvers = {
  Mutation: {
    async createArticle(
      _: any,
      { request }: { request: CreateArticleRequest },
      { dataSources, userId }: Context,
    ): Promise<CreateArticleResponse> {
      try {
        if (!userId) {
          throw new GraphQLError("로그인이 필요합니다.");
        }

        const bookInfo: GetBookInfoItem = await dataSources.aladin.getBookInfo(
          request.isbn,
        );
        const bookSchema: BookSchema = {
          isbn: bookInfo.isbn13,
          title: bookInfo.title,
          link: bookInfo.link,
          author: bookInfo.author,
          pubDate: bookInfo.pubDate,
          description: bookInfo.description,
          creator: bookInfo.creator,
          cover: bookInfo.cover,
          categoryId: bookInfo.categoryId,
          categoryName: bookInfo.categoryName,
          publisher: bookInfo.publisher,
          customerReviewRank: bookInfo.customerReviewRank,
        };

        await dataSources.db.insertBook(bookSchema);

        await dataSources.db.createArticle({
          title: request.articleTitle,
          content: request.articleContent,
          userId,
          isbn: request.isbn,
        });

        return {
          msg: "성공적으로 작성되었습니다.",
        };
      } catch (err) {
        if (err.message === "키에 해당하는 상품이 존재하지 않습니다.") {
          throw new GraphQLError("해당 ISBN의 책이 존재하지 않습니다.");
        } else if (err.message === "로그인이 필요합니다.") {
          throw new GraphQLError(err.message);
        }
        throw new GraphQLError("글 작성에 실패했습니다.");
      }
    },
  },
};
