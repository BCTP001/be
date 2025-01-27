import { BatchedSQLDataSource } from "@nic-jennings/sql-datasource";
import { User } from "../types/interface/pg-api";

export class PGAPI extends BatchedSQLDataSource {
  insertUser = async (username: string, name: string): Promise<User> => {
    const createdUsers = await this.db.write
      .insert({ username, name })
      .into("useruser")
      .returning(["id", "username", "name"]);
    return createdUsers[0];
  };

  findAllUsers = async (): Promise<User[]> => {
    return await this.db.query.select("*").from("useruser");
  };

  findUserById = async (id: string): Promise<User> => {
    const users = await this.db.query
      .select("*")
      .from("useruser")
      .where({ id });
    return users[0];
  };
}
