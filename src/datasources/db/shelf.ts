import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import { Book, Shelf, Useruser } from "@interface/db";

const shelf = {
  async createShelf(
    knex: DataSourceKnex,
    userId: Useruser["id"],
    name: Shelf["name"],
  ): Promise<void> {
    await knex
      .insert({ name, userId })
      .into("shelf")
      .returning(["id", "name", "userId"]);
  },

  async getShelfInfo(
    knex: DataSourceKnex,
    name: Shelf["name"],
  ): Promise<{ name: string; id: number }> {
    const shelfRow = await knex
      .select("name", "id")
      .from("shelf")
      .where({ name });

    return shelfRow[0];
  },

  async insertContains(
    knex: DataSourceKnex,
    shelfId: Shelf["id"],
    isbn: Book["isbn"],
  ): Promise<void> {
    await knex
      .insert({ shelfId, isbn })
      .into("contains")
      .onConflict(["shelfId", "isbn"])
      .ignore();
  },

  async deleteContains(
    knex: DataSourceKnex,
    isbn: Book["isbn"],
  ): Promise<void> {
    await knex.from("contains").where({ isbn }).del();
  },

  async getBooksInShelf(
    knex: DataSourceKnex,
    shelfName: Shelf["name"],
  ): Promise<Book["isbn"][]> {
    const containsRow: Pick<Book, "isbn">[] = await knex
      .select("c.isbn")
      .from({ s: "shelf" })
      .join({ c: "contains" }, "s.id", "c.shelfId")
      .where("s.name", shelfName);

    return containsRow.map((row) => row.isbn);
  },
};

export default shelf;
