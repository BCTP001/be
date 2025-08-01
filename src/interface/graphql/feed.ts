import { String, Int } from ".";

export type Feed = {
  isbn13: String;
  bookName?: String;
  bookDescription?: String;
  bookPhotoUrl?: String;
  categoryName?: String;
  author?: String;
  libraryName?: String;
  reviewContent?: String;
  rating?: Int;
};
