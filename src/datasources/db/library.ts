import { DataSourceKnex, BatchedSQLDataSource as DB } from "@nic-jennings/sql-datasource";
import { Id, Name, LibraryWithAuthority } from "@interface/db/library";
import { Id as UserId } from "@interface/db/user";
import {
  OwnerAuthority,
  // ManagerAuthority,
  // MemberAuthority,
} from "@interface/db/affiliates";

const library = {
  async create(knex: DataSourceKnex, name: Name): Promise<Id> {
    const created = await knex
      .insert({ name })
      .into("library")
      .returning(["id"]);
    return created[0].id;
  },

  async assignOwnership(knex: DataSourceKnex, id: Id, userId: UserId) {
    await knex
      .insert({
        libraryId: id,
        userId,
        authority: OwnerAuthority,
      })
      .into("affiliates");
  },

  async selectByUser(knex: DataSourceKnex, userId: UserId): Promise<LibraryWithAuthority[]> {
    return await knex
      .select(["libraryId AS id", "name", "authority"])
      .from("affiliates")
      .where("userId", userId)
      .join("library", "affiliates.libraryId", "=", "library.id");
  },
};

export default library;
