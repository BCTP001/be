export type Id = number;
export type Time = Date;
export type Status = string;
import { Isbn } from "@interface/db/book";
import { Id as LibraryId } from "@interface/db/library";
export type Requests = {
  id: Id;
  time: Time;
  status: Status;
  isbn: Isbn;
  libraryId: LibraryId;
};
