import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import {
  InsertReviewArgs,
  Int,
  Isbn,
  Review,
  UpdateReviewArgs,
} from "@interface/to-be-deprecated";

const review = {
  async searchReviewsByBook(
    knex: DataSourceKnex,
    isbn: Isbn,
  ): Promise<Review[]> {
    return await knex.select("*").from("review").where({ isbn });
  },

  async lookupReview(knex: DataSourceKnex, id: Int): Promise<Review> {
    const reviews = await knex.select("*").from("review").where({ id });
    return reviews[0];
  },

  async insertReview(knex: DataSourceKnex, insertReviewArgs: InsertReviewArgs) {
    const newReviews = await knex
      .insert(insertReviewArgs)
      .into("review")
      .returning(["id"]);
    return newReviews[0].id;
  },

  async updateReview(knex: DataSourceKnex, updateReviewArgs: UpdateReviewArgs) {
    const { id, ...updatedInfo } = updateReviewArgs;
    const updatedReviews = await knex
      .table("review")
      .where({ id })
      .update(updatedInfo, ["id"]);
    return updatedReviews[0].id;
  },

  async deleteReview(knex: DataSourceKnex, id: Int) {
    const deletedReviews = await knex("review")
      .where("id", id)
      .del()
      .returning(["id"]);
    return deletedReviews[0].id;
  },
};

export default review;
