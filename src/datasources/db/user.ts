import { BatchedSQLDataSource as DB } from "@nic-jennings/sql-datasource";
import { User, Id as UserId } from "@interface/db/user";

const user = {
  async findById(db: DB, id: UserId): Promise<User> {
    const users = await db.db.query
      .select("*")
      .from("useruser")
      .where({ id });
    return users[0];
  }
};

export default user;
