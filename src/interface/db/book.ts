import { Varchar, Text, XDate, Numeric, Int } from "./pg";

export type Book = {
  isbn: Varchar<13>;
  title: Text;
  link: Text;
  author: Text;
  pubDate: XDate;
  description: Text;
  creator: Text;
  cover: Text;
  categoryId: Int;
  categoryName: Text;
  publisher: Text;
  customerReviewRank: Numeric<3, 1>;
};
