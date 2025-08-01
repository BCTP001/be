import { String, Int } from ".";

export type RecommendBooksRequest = {
  keyword?: String;
  top_n?: Int;
};

export type RecommendBookInfo = {
  title?: String;
  description?: String;
  category?: String;
  cover?: String;
  author?: String;
};
