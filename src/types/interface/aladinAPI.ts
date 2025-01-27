// SEARCH

export interface SearchText {
  query: string;
}

export interface SearchOption {
  searchQuery: string;
  queryType?: string;
  sort?: string;
  maxResult?: string;
}

export interface AladinAPIBookItem {
  title: string;
  link: string;
  author: string;
  pubDate: string;
  description: string;
  creator: string;
  isbn: string;
  isbn13: string;
  itemId: number;
  priceSales: number;
  priceStandard: number;
  stockStatus: string;
  mileage: number;
  cover: string;
  categoryId: number;
  categoryName: string;
  publisher: string;
  customerReivewRank: number;
}

export interface AladinAPISearchResponse {
  version: string;
  title: string;
  link: string;
  pubDate: string;
  imageUrl: string;
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  query: string;
  searchCategoryId: number;
  searchCategoryName: string;
  item: AladinAPIBookItem[];
}

// GET BOOK INFO

export interface GetBookInfoRequest {
  isbn13: string;
}


export interface Author {
  authorType: string;
  authorid: number;
  desc: string;
  name: string;
}

export interface Ebook {
  itemId: number;
  isbn: string;
  priceSales: number;
  link: string;
}

export interface Bookinfo {
  subTitle: string;
  originalTitle: string;
  itemPage: number;
  toc: string;
  letslookimg: string[];
  author: Author[];
  ebookList: Ebook[];
}

export interface GetBookInfoItem {
  title: string;
  link: string;
  author: string;
  pubDate: string;
  description: string;
  creator: string;
  isbn: string;
  isbn13: string;
  itemId: number;
  priceSales: number;
  priceStandard: number;
  stockStatus: string;
  mileage: number;
  cover: string;
  categoryId: number;
  categoryName: string;
  publisher: string;
  customerReivewRank: number;
  bookinfo: Bookinfo
}

export type AladinAPIGetBookInfoResponse = {
  version: string;
  title: string;
  link: string;
  pubDate: string;
  imageUrl: string;
  startIndex: number;
  itemsPerPage: number;
  query: string;
  searchCategoryId: number;
  searchCategoryName: string;
  item: GetBookInfoItem[];
};
