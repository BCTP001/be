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
}
