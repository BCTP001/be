import { String, Int } from ".";

export type GetBookInfoRequest = {
  isbn13: String;
};

export type Author = {
  authorType?: String;
  authorid?: Int;
  desc?: String;
  name?: String;
};

export type Ebook = {
  itemId?: Int;
  isbn?: String;
  priceSales?: Int;
  link?: String;
};

export type Bookinfo = {
  subTitle?: String;
  originalTitle?: String;
  itemPage?: Int;
  toc?: String;
  letslookimg?: (String | null)[];
  author?: (Author | null)[];
  ebookList?: (Ebook | null)[];
};

export type GetBookInfoItem = {
  title?: String;
  link?: String;
  author?: String;
  pubDate?: String;
  description?: String;
  creator?: String;
  isbn?: String;
  isbn13?: String;
  itemId?: Int;
  priceSales?: Int;
  priceStandard?: Int;
  stockStatus?: String;
  mileage?: Int;
  cover?: String;
  categoryId?: Int;
  categoryName?: String;
  publisher?: String;
  customerReivewRank?: Int;
  bookinfo?: Bookinfo;
};
