import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import { Useruser, Library, Affiliates, Authority, Book } from "@interface/db";

const library = {
  async create(
    knex: DataSourceKnex,
    name: Library["name"],
  ): Promise<Library["id"]> {
    return (await knex.insert({ name }).into("library").returning(["id"]))[0]
      .id;
  },

  async assignOwnership(
    knex: DataSourceKnex,
    libraryId: Library["id"],
    userId: Useruser["id"],
  ) {
    await knex
      .insert({
        libraryId,
        userId,
        authority: Authority.Owner,
      })
      .into("affiliates");
  },

  async selectByUser(
    knex: DataSourceKnex,
    userId: Useruser["id"],
  ): Promise<(Library & Pick<Affiliates, "authority">)[]> {
    return await knex
      .select(["libraryId AS id", "name", "authority"])
      .from("affiliates")
      .where("userId", userId)
      .join("library", "affiliates.libraryId", "=", "library.id");
  },

  async selectByBook(
    knex: DataSourceKnex,
    userId: Useruser["id"],
    isbn: Book['isbn'],
  ): Promise<(Library & Pick<Affiliates, "authority">)[]> {
    return await knex
      .with('affiliated', k => k
        .select(["libraryId AS i", "authority"])
        .from("affiliates")
        .where("userId", userId)
      )
      .with('providing', k => k
        .select(["i", "authority"])
        .from("provides")
        .innerJoin("affiliated", "libraryId", "=", "i")
        .where("isbn", isbn)
      )
      .select(["id", "name", "authority"])
      .from("providing")
      .join("library", "id", "=", "i");
  },

  async lookupMembers(
    knex: DataSourceKnex,
    libraryId: Library["id"],
  ): Promise<(Omit<Useruser, "hashedPw"> & Pick<Affiliates, "authority">)[]> {
    return await knex
      .select([
        "userId AS id",
        "username",
        "name",
        "profilePic",
        "bio",
        "authority",
      ])
      .from("affiliates")
      .where("libraryId", libraryId)
      .join("useruser", "affiliates.userId", "=", "useruser.id");
  },
};

export default library;
