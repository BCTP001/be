import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import { BookSchema } from "@interface/to-be-deprecated";

const book = {
  async isBookExists(knex: DataSourceKnex, isbn13: string): Promise<boolean> {
    return (await knex.select("*").from("book").where({ isbn: isbn13 }))
      ? true
      : false;
  },

  async getExistingBooks(
    knex: DataSourceKnex,
    isbn13List: string[],
  ): Promise<string[]> {
    const existingBooks = await knex
      .select("isbn")
      .from("book")
      .whereIn("isbn", isbn13List);

    return existingBooks.map((book) => book.isbn);
  },

  async insertBook(
    knex: DataSourceKnex,
    bookInfoObject: BookSchema,
  ): Promise<void> {
    await knex.insert(bookInfoObject).into("book").onConflict("isbn").ignore();
  },
};

export default book;
