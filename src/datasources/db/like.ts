import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import { Int } from "@interface/to-be-deprecated";

const like = {
  async insertLikes(
    knex: DataSourceKnex,
    userId: Int,
    isbnList: string[],
  ): Promise<void> {
    const newLikes = isbnList.map((isbn) => ({ userId, isbn }));
    await knex
      .insert(newLikes)
      .into("likes")
      .onConflict(["userId", "isbn"])
      .ignore();
  },

  async deleteLikes(
    knex: DataSourceKnex,
    userId: Int,
    isbnList: string[],
  ): Promise<void> {
    await knex.from("likes").where({ userId }).whereIn("isbn", isbnList).del();
  },

  async getLikeBooks(
    knex: DataSourceKnex,
    userId: Int,
  ): Promise<{ isbn: string }[]> {
    const likeRows = await knex.select("isbn").from("likes").where({ userId });
    return likeRows.map((row) => ({ isbn: row.isbn }));
  },
};

export default like;
