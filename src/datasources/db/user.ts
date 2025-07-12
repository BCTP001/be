import { GraphQLError } from "graphql";
import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import { Useruser } from "@interface/db";
import { checkPw } from "@utils";

const user = {
  async findById(knex: DataSourceKnex, id: Useruser["id"]): Promise<Useruser> {
    const users = await knex.select("*").from("useruser").where({ id });
    return users[0];
  },

  async createUser(
    knex: DataSourceKnex,
    name: Useruser["name"],
    username: Useruser["username"],
    hashedPw: Useruser["hashedPw"],
  ): Promise<Useruser> {
    let createdUsers: Useruser[];
    try {
      createdUsers = await knex
        .insert({ name, username, hashedPw })
        .into("useruser")
        .returning(["id", "username", "name"]);
    } catch (e) {
      if (e.detail == `Key (username)=(${username}) already exists.`) {
        throw new GraphQLError(`Username "${username}" already exists.`, {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      } else {
        throw e;
      }
    }
    return createdUsers[0];
  },

  async getIfPasses(
    knex: DataSourceKnex,
    username: Useruser["username"],
    password: string,
  ): Promise<Useruser> {
    const users: Useruser[] = await knex("useruser")
      .select("*")
      .where({ username });
    if (users.length === 0) {
      throw new GraphQLError(`Username "${username}" doesn't exist.`, {
        extensions: {
          code: "FORBIDDEN",
        },
      });
    }
    const user = users[0];
    const hashedPw = user.hashedPw;
    if (!(await checkPw(password, hashedPw))) {
      throw new GraphQLError(`Wrong password for username "${username}".`, {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    }
    return user;
  },

  async findAllUsers(knex: DataSourceKnex): Promise<Useruser[]> {
    return await knex.select("*").from("useruser");
  },

  async findUserById(
    knex: DataSourceKnex,
    id: Useruser["id"],
  ): Promise<Useruser> {
    const users = await knex.select("*").from("useruser").where({ id });
    return users[0];
  },
};

export default user;
