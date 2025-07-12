import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import { Useruser, Library, Affiliates, Authority } from "@interface/db";

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
