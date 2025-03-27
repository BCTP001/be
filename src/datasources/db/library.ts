import { BatchedSQLDataSource as DB } from "@nic-jennings/sql-datasource";
import { Id, Name, LibraryWithAuthority } from "@interface/db/library";
import { Id as UserId } from "@interface/db/user";
import {
  OwnerAuthority,
  // ManagerAuthority,
  // MemberAuthority,
} from "@interface/db/affiliates";

const library = {
  async create(db: DB, name: Name): Promise<Id> {
    const created = await db.db.write
      .insert({ name })
      .into("library")
      .returning(["id"]);
    return created[0].id;
  },

  async assignOwnership(db: DB, id: Id, userId: UserId) {
    await db.db.write
      .insert({
        libraryId: id,
        userId,
        authority: OwnerAuthority,
      })
      .into("affiliates");
  },

  async selectByUser(db: DB, userId: UserId): Promise<LibraryWithAuthority[]> {
    return await db.db.query
      .select(["libraryId AS id", "name", "authority"])
      .from("affiliates")
      .where("userId", userId)
      .join("library", "affiliates.libraryId", "=", "library.id");
  },
};

export default library;
