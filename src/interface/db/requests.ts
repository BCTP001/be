import { Serial, Timestamp, Char, Varchar } from "./pg";
import { Book } from "@interface/db/book";
import { Library } from "@interface/db/library";
import { Useruser } from "./useruser";

export type Requests = {
  id: Serial;
  time: Timestamp;
  status: Char;
  requestType: Varchar<10>;
  isbn: Book["isbn"];
  libraryId: Library["id"];
  userId: Useruser["id"];
};
