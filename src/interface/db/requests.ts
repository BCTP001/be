import { Serial, Timestamp, Char } from "./pg";
import { Book } from "@interface/db/book";
import { Library } from "@interface/db/library";

export type Requests = {
  id: Serial;
  time: Timestamp;
  status: Char;
  isbn: Book["isbn"];
  libraryId: Library["id"];
};
