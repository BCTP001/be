import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import {
  Useruser,
  Library,
  Affiliates,
  Authority,
  Book,
  Requests,
} from "@interface/db";
import { MembershipRequestItem, RequestItem } from "@interface/graphql/library";
import { RequestLibraryMembership } from "@interface/db/requestLibraryMembership";

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
    isbn: Book["isbn"],
  ): Promise<(Library & Pick<Affiliates, "authority">)[]> {
    return await knex
      .with("affiliated", (k) =>
        k
          .select(["libraryId AS i", "authority"])
          .from("affiliates")
          .where("userId", userId),
      )
      .with("providing", (k) =>
        k
          .select(["i", "authority"])
          .from("provides")
          .innerJoin("affiliated", "libraryId", "=", "i")
          .where("isbn", isbn),
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

  async selectById(
    knex: DataSourceKnex,
    libraryId: Library["id"],
  ): Promise<Library | null> {
    const result = await knex("library").where("id", libraryId).first();
    return result || null;
  },

  async existsBook(
    knex: DataSourceKnex,
    libraryId: Library["id"],
    isbn: Book["isbn"],
  ): Promise<boolean> {
    const result = await knex("provides").where({ libraryId, isbn }).first();
    return !!result;
  },

  async getIsbnBylibraryId(
    knex: DataSourceKnex,
    libraryId: Library["id"],
  ): Promise<{ isbn: Book["isbn"] }[]> {
    return await knex("provides").select("isbn").where("libraryId", libraryId);
  },

  async createRequest(
    knex: DataSourceKnex,
    {
      isbn,
      libraryId,
      userId,
      requestType,
    }: {
      isbn: Book["isbn"];
      libraryId: Library["id"];
      userId: Useruser["id"];
      requestType: Requests["requestType"];
    },
  ): Promise<void> {
    await knex("requests").insert({
      isbn,
      libraryId,
      userId,
      requestType,
      status: "P", // 항상 Pending 상태로 시작
    });
  },

  async getAuthorityOfUser(
    knex: DataSourceKnex,
    userId: Useruser["id"],
    libraryId: Library["id"],
  ): Promise<number | null> {
    const result = await knex("affiliates")
      .select("authority")
      .where({ userId, libraryId })
      .first();

    return result?.authority ?? null;
  },

  async selectRequestsByLibraryId(
    knex: DataSourceKnex,
    libraryId: Library["id"],
  ): Promise<RequestItem[]> {
    return await knex("requests")
      .select("id", "time", "status", "requestType", "isbn", "userId")
      .where("libraryId", libraryId)
      .orderBy("time", "desc");
  },

  async selectByRequestId(
    knex: DataSourceKnex,
    requestId: Requests["id"],
  ): Promise<RequestItem | undefined> {
    return knex("requests").where("id", requestId).first();
  },

  async updateStatus(
    knex: DataSourceKnex,
    requestId: Requests["id"],
    newStatus: Requests["status"],
  ): Promise<void> {
    return knex("requests")
      .where("id", requestId)
      .update({ status: newStatus });
  },

  async createRequestLibraryMembership(
    knex: DataSourceKnex,
    libraryId: Library["id"],
    userId: Useruser["id"],
    membershipRequestType: RequestLibraryMembership["membershipRequestType"],
  ): Promise<void> {
    await knex("requestLibraryMembership").insert({
      time: new Date(),
      status: "P",
      membershipRequestType,
      libraryId,
      userId,
    });
  },

  async selectMembershipRequestsByLibraryId(
    knex: DataSourceKnex,
    libraryId: Library["id"],
  ): Promise<MembershipRequestItem[]> {
    return await knex("requestLibraryMembership")
      .select(
        "id",
        "time",
        "status",
        "membershipRequestType",
        "libraryId",
        "userId",
      )
      .where({ libraryId })
      .orderBy("time", "desc");
  },
};

export default library;
