import { Book } from "./book";
import { Shelf } from "./shelf";

export type Contains = {
  shelfId: Shelf["id"];
  isbn: Book["isbn"];
};
