export type Id = string;
export type Username = string;
export type Name = string;

export interface User {
  id: Id;
  username: Username;
  name: Name;
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

export interface UpdateShelfRequest {
  containList: string[];
  excludeList: string[];
  userId: number;
}

export interface UpdateShelfResponse {
  msg: string;
  shelfName: string;
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
