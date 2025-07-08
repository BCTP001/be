import { BatchedSQLDataSource } from "@nic-jennings/sql-datasource";
import { PgFeedObject } from "@interface/to-be-deprecated";
import library from "@datasources/db/library";
import user from "@datasources/db/user";
import review from "@datasources/db/review";
import like from "@datasources/db/like";
import shelf from "@datasources/db/shelf";
import book from "@datasources/db/book";

export class DB extends BatchedSQLDataSource {
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

  library = library;
  user = user;
  review = review;
  like = like;
  shelf = shelf;
  book = book;
}
