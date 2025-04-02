import { BatchedSQLDataSource } from "@nic-jennings/sql-datasource";
import {
  User,
  Username,
  Name,
  Isbn,
  Review,
  Id,
  HashedPw,
  InsertReviewArgs,
  UpdateReviewArgs,
  PgFeedObject,
  Password,
  WelcomePackage,
  Useruser,
  BookSchema,
  ArticleSchema,
} from "@interface/db";
import { GraphQLError } from "graphql";
import { checkPw } from "@utils";

export class DB extends BatchedSQLDataSource {
  createUser = async (
    name: Name,
    username: Username,
    hashedPw: HashedPw,
  ): Promise<User> => {
    let createdUsers: User[];
    try {
      createdUsers = await this.db.write
        .insert({ name, username, hashedPw })
        .into("useruser")
        .returning(["id", "username", "name"]);
    } catch (e) {
      if (e.detail == `Key (username)=(${username}) already exists.`) {
        throw new GraphQLError(`Username "${username}" already exists.`, {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      } else {
        throw e;
      }
    }
    return createdUsers[0];
  };

  getWelcomePackage = async (
    username: Username,
    password: Password,
  ): Promise<WelcomePackage> => {
    const users: Useruser[] = await this.db
      .query("useruser")
      .select("*")
      .where({ username });
    if (users.length === 0) {
      throw new GraphQLError(`Username "${username}" doesn't exist.`, {
        extensions: {
          code: "FORBIDDEN",
        },
      });
    }
    const user = users[0];
    const hashedPw = user.hashedPw;
    if (!(await checkPw(password, hashedPw))) {
      throw new GraphQLError(`Wrong password for username "${username}".`, {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    }
    return {
      signedInAs: user,
    };
  };

  insertUser = async (username: Username, name: Name): Promise<User> => {
    const createdUsers = await this.db.write
      .insert({ username, name })
      .into("useruser")
      .returning(["id", "username", "name"]);
    return createdUsers[0];
  };

  findAllUsers = async (): Promise<User[]> => {
    return await this.db.query.select("*").from("useruser");
  };

  findUserById = async (id: Id): Promise<User> => {
    const users = await this.db.query
      .select("*")
      .from("useruser")
      .where({ id });
    return users[0];
  };

  getFeed = async (): Promise<PgFeedObject[]> => {
    const feedRows = await this.db.query
      .select(
        "b.isbn AS isbn13",
        "l.name AS libraryName",
        "r.content AS reviewContent",
        "r.rating AS rating",
      )
      .from({ b: "book" })
      .join({ r: "review" }, "b.isbn", "r.isbn")
      .join({ p: "provides" }, "b.isbn", "p.isbn")
      .join({ l: "library" }, "p.libraryId", "l.id")
      .orderByRaw("random()")
      .limit(5);
    return feedRows;
  };

  isBookExists = async (isbn13: string): Promise<boolean> => {
    return (await this.db.query
      .select("*")
      .from("book")
      .where({ isbn: isbn13 }))
      ? true
      : false;
  };

  getExistingBooks = async (isbn13List: string[]): Promise<string[]> => {
    const existingBooks = await this.db.query
      .select("isbn")
      .from("book")
      .whereIn("isbn", isbn13List);

    return existingBooks.map((book) => book.isbn);
  };

  insertBook = async (bookInfoObject: BookSchema): Promise<void> => {
    await this.db.write
      .insert(bookInfoObject)
      .into("book")
      .onConflict(["isbn"])
      .ignore();
  };

  createShelf = async (userId: Id, name: string): Promise<void> => {
    await this.db.write
      .insert({ name, userId })
      .into("shelf")
      .returning(["id", "name", "userId"]);
  };

  getShelfInfo = async (
    name: string,
  ): Promise<{ name: string; id: number }> => {
    const shelfRow = await this.db.query
      .select("name", "id")
      .from("shelf")
      .where({ name });

    return shelfRow[0];
  };

  insertContains = async (shelfId: number, isbn: string): Promise<void> => {
    await this.db.write
      .insert({ shelfId, isbn })
      .into("contains")
      .onConflict(["shelfId", "isbn"])
      .ignore();
  };

  deleteContains = async (isbn: string): Promise<void> => {
    await this.db.write.from("contains").where({ isbn }).del();
  };

  getBooksInShelf = async (shelfName: string): Promise<{ isbn: string }[]> => {
    const containsRow = await this.db.query
      .select("c.isbn")
      .from({ s: "shelf" })
      .join({ c: "contains" }, "s.id", "c.shelfId")
      .where("s.name", shelfName);

    return containsRow.map((row) => ({ isbn: row.isbn }));
  };

  searchReviewsByBook = async (isbn: Isbn): Promise<Review[]> => {
    return await this.db.query.select("*").from("review").where({ isbn });
  };

  lookupReview = async (id: Id): Promise<Review> => {
    const reviews = await this.db.query
      .select("*")
      .from("review")
      .where({ id });
    return reviews[0];
  };

  insertReview = async (insertReviewArgs: InsertReviewArgs) => {
    const newReviews = await this.db.write
      .insert(insertReviewArgs)
      .into("review")
      .returning(["id"]);
    return newReviews[0].id;
  };

  updateReview = async (updateReviewArgs: UpdateReviewArgs) => {
    const { id, ...updatedInfo } = updateReviewArgs;
    const updatedReviews = await this.db.write
      .table("review")
      .where({ id })
      .update(updatedInfo, ["id"]);
    return updatedReviews[0].id;
  };

  deleteReview = async (id: Id) => {
    const deletedReviews = await this.db.write
      .table("review")
      .where("id", id)
      .del()
      .returning(["id"]);
    return deletedReviews[0].id;
  };

  insertLikes = async (userId: Id, isbnList: string[]): Promise<void> => {
    const newLikes = isbnList.map((isbn) => ({ userId, isbn }));
    await this.db.write
      .insert(newLikes)
      .into("likes")
      .onConflict(["userId", "isbn"])
      .ignore();
  };

  deleteLikes = async (userId: Id, isbnList: string[]): Promise<void> => {
    await this.db.write
      .from("likes")
      .where({ userId })
      .whereIn("isbn", isbnList)
      .del();
  };

  getLikeBooks = async (userId: Id): Promise<{ isbn: string }[]> => {
    const likeRows = await this.db.query
      .select("isbn")
      .from("likes")
      .where({ userId });
    return likeRows.map((row) => ({ isbn: row.isbn }));
  };

  createArticle = async (articleInfo: ArticleSchema): Promise<void> => {
    await this.db.write.insert(articleInfo).into("article");
  };
}
