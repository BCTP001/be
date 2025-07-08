import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import { Int } from "@interface/to-be-deprecated";

const shelf = {
  async createShelf(
    knex: DataSourceKnex,
    userId: Int,
    name: string,
  ): Promise<void> {
    await knex
      .insert({ name, userId })
      .into("shelf")
      .returning(["id", "name", "userId"]);
  },

  async getShelfInfo(
    knex: DataSourceKnex,
    name: string,
  ): Promise<{ name: string; id: number }> {
    const shelfRow = await knex
      .select("name", "id")
      .from("shelf")
      .where({ name });

    return shelfRow[0];
  },

  async insertContains(
    knex: DataSourceKnex,
    shelfId: number,
    isbn: string,
  ): Promise<void> {
    await knex
      .insert({ shelfId, isbn })
      .into("contains")
      .onConflict(["shelfId", "isbn"])
      .ignore();
  },

  async deleteContains(knex: DataSourceKnex, isbn: string): Promise<void> {
    await knex.from("contains").where({ isbn }).del();
  },

  async getBooksInShelf(
    knex: DataSourceKnex,
    shelfName: string,
  ): Promise<{ isbn: string }[]> {
    const containsRow = await knex
      .select("c.isbn")
      .from({ s: "shelf" })
      .join({ c: "contains" }, "s.id", "c.shelfId")
      .where("s.name", shelfName);

    return containsRow.map((row) => ({ isbn: row.isbn }));
  },
};

export default shelf;
