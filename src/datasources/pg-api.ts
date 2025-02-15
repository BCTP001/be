import { BatchedSQLDataSource } from "@nic-jennings/sql-datasource";
import { User, PgFeedObject } from "../types/interface/pg-api";

export class PGAPI extends BatchedSQLDataSource {
  insertUser = async (username: string, name: string): Promise<User> => {
    const createdUsers = await this.db.write
      .insert({ username, name })
      .into("useruser")
      .returning(["id", "username", "name"]);
    return createdUsers[0];
  };

  findAllUsers = async (): Promise<User[]> => {
    return await this.db.query.select("*").from("useruser");
  };

  findUserById = async (id: string): Promise<User> => {
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

  insertBook = async (isbn: string): Promise<void> => {
    await this.db.write.insert({ isbn }).into("book");
  };

  insertContains = async (userId: number, isbn: string): Promise<string> => {
    const shelfRow = await this.db.query
      .select("name", "id")
      .from("shelf")
      .where({ userId });

    await this.db.write
      .insert({ shelfId: shelfRow[0].id, isbn })
      .into("contains")
      .onConflict(["shelfId", "isbn"])
      .ignore();

    return shelfRow[0].name;
  };

  deleteContains = async (isbn: string): Promise<void> => {
    await this.db.write.from("contains").where({ isbn }).del();
  };

  getBooksInShelf = async (userId: number): Promise<{ isbn: string }[]> => {
    const containsRow = await this.db.query
      .select("c.isbn")
      .from({ s: "shelf" })
      .join({ c: "contains" }, "s.id", "c.shelfId")
      .where("s.userId", userId);

    return containsRow.map((row) => ({ isbn: row.isbn }));
  };
}
