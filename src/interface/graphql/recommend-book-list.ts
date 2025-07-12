export type RecommendQueryType =
  | "ItemNewAll"
  | "ItemNewSpecial"
  | "Bestseller"
  | "BlogBest";

export type RecommendBookListRequest = {
  queryType: RecommendQueryType;
};
