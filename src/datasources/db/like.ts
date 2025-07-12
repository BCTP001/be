import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import { Book, Likes, Useruser } from "@interface/db";

const like = {
  async insertLikes(
    knex: DataSourceKnex,
    userId: Useruser["id"],
    isbnList: Book["isbn"][],
  ): Promise<void> {
    const newLikes: Likes[] = isbnList.map((isbn) => ({ userId, isbn }));
    await knex
      .insert(newLikes)
      .into("likes")
      .onConflict(["userId", "isbn"])
      .ignore();
  },

  async deleteLikes(
    knex: DataSourceKnex,
    userId: Useruser["id"],
    isbnList: Book["isbn"][],
  ): Promise<void> {
    await knex.from("likes").where({ userId }).whereIn("isbn", isbnList).del();
  },

  async getLikeBooks(
    knex: DataSourceKnex,
    userId: Useruser["id"],
  ): Promise<Book["isbn"][]> {
    const likeRows: Pick<Likes, "isbn">[] = await knex
      .select("isbn")
      .from("likes")
      .where({ userId });
    return likeRows.map((row) => row.isbn);
  },
};

export default like;
