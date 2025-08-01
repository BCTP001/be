import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import { Book } from "@interface/db";

const book = {
  async isBookExists(
    knex: DataSourceKnex,
    isbn13: Book["isbn"],
  ): Promise<boolean> {
    return (await knex.select("*").from("book").where({ isbn: isbn13 }))
      ? true
      : false;
  },

  async getExistingBooks(
    knex: DataSourceKnex,
    isbn13List: Book["isbn"][],
  ): Promise<Book["isbn"][]> {
    return (
      await knex.select("isbn").from("book").whereIn("isbn", isbn13List)
    ).map((book) => book.isbn);
  },

  async insertBook(knex: DataSourceKnex, bookInfoObject: Book): Promise<void> {
    await knex.insert(bookInfoObject).into("book").onConflict("isbn").ignore();
  },
};

export default book;
