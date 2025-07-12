import { DataSourceKnex } from "@nic-jennings/sql-datasource";
import { Review, Book } from "@interface/db";

const review = {
  async searchReviewsByBook(
    knex: DataSourceKnex,
    isbn: Book["isbn"],
  ): Promise<Review[]> {
    return await knex.select("*").from("review").where({ isbn });
  },

  async lookupReview(knex: DataSourceKnex, id: Review["id"]): Promise<Review> {
    const reviews = await knex.select("*").from("review").where({ id });
    return reviews[0];
  },

  async insertReview(
    knex: DataSourceKnex,
    insertReviewArgs: Pick<Review, "userId" | "isbn" | "rating" | "content">,
  ) {
    const newReviews = await knex
      .insert(insertReviewArgs)
      .into("review")
      .returning(["id"]);
    return newReviews[0].id;
  },

  async updateReview(
    knex: DataSourceKnex,
    updateReviewArgs: Pick<Review, "id" | "rating" | "content">,
  ) {
    const { id, ...updatedInfo } = updateReviewArgs;
    const updatedReviews = await knex
      .table("review")
      .where({ id })
      .update(updatedInfo, ["id"]);
    return updatedReviews[0].id;
  },

  async deleteReview(knex: DataSourceKnex, id: Review["id"]) {
    const deletedReviews = await knex("review")
      .where("id", id)
      .del()
      .returning(["id"]);
    return deletedReviews[0].id;
  },
};

export default review;
