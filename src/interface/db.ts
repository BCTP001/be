export type Id = string;
export type Username = string;
export type Name = string;
export type Password = string;
export type HashedPw = string;

export interface User {
  id: Id;
  username: Username;
  name: Name;
}

export interface Useruser {
  id: Id;
  username: Username;
  hashedPw: HashedPw;
  name: Name;
}

export interface WelcomePackage {
  signedInAs: User;
}

export interface Feed {
  isbn13: string;
  bookName: string;
  bookDescription: string;
  bookPhotoUrl: string;
  categoryName: string;
  author: string;
  libraryName: string;
  reviewContent: string;
  rating: number;
}

export interface PgFeedObject {
  isbn13: string;
  libraryName: string;
  reviewContent: string;
  rating: number;
}

export interface UserId {
  userId: number;
}

export interface getBooksInShelfRequest {
  shelfName: string;
}

export interface UpdateShelfRequest {
  containList: string[];
  excludeList: string[];
  shelfName: string;
}

export interface UpdateShelfResponse {
  msg: string;
  shelfName: string;
}

export interface CreateShelfRequest {
  shelfName: string;
  userId: Id;
}

export interface CreateShelfResponse {
  msg: string;
}

export type Isbn = string;
export type Rating = number;
export type Content = string;

export interface Review {
  id: Id;
  userId: Id;
  isbn: Isbn;
  rating: Rating;
  content: Content;
}

export interface InsertReviewArgs {
  userId: Id;
  isbn: Isbn;
  rating: Rating;
  content: Content;
}

export interface UpdateReviewArgs {
  id: Id;
  rating: Rating;
  content: Content;
}

export interface UpdateLikeBooksRequest {
  containList: string[];
  excludeList: string[];
}

export interface UpdateLikeBooksResponse {
  msg: string;
}
export interface BookSchema {
  isbn: string;
  title: string;
  link: string;
  author: string;
  pubDate: string;
  description: string;
  creator: string;
  cover: string;
  categoryId: number;
  categoryName: string;
  publisher: string;
  customerReviewRank: number;
}

export interface RecommendBooksRequest {
  keyword: string;
  top_n: number;
}

export interface RecommendBookInfo {
  title: string;
  description: string;
  category: string;
  cover: string;
  author: string;
}

export interface BookData {
  title: string;
  description: string;
  categoryname: string;
  cover: string;
  author: string;
}
