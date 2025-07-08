import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import { User, Id as UserId, Name, Username } from "@interface/db/user";
import {
  HashedPw,
  Int,
  Password,
  Useruser,
  WelcomePackage,
} from "@interface/to-be-deprecated";
import { GraphQLError } from "graphql";
import { checkPw } from "@utils";

const user = {
  async findById(knex: DataSourceKnex, id: UserId): Promise<User> {
    const users = await knex.select("*").from("useruser").where({ id });
    return users[0];
  },

  async createUser(
    knex: DataSourceKnex,
    name: Name,
    username: Username,
    hashedPw: HashedPw,
  ): Promise<User> {
    let createdUsers: User[];
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

  async getWelcomePackage(
    knex: DataSourceKnex,
    username: Username,
    password: Password,
  ): Promise<WelcomePackage> {
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
    return {
      signedInAs: user,
    };
  },

  async findAllUsers(knex: DataSourceKnex): Promise<User[]> {
    return await knex.select("*").from("useruser");
  },

  async findUserById(knex: DataSourceKnex, id: Int): Promise<User> {
    const users = await knex.select("*").from("useruser").where({ id });
    return users[0];
  },
};

export default user;
