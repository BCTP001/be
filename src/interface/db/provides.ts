import { Book } from "@interface/db/book";
import { Library } from "@interface/db/library";

export type Provides = {
  isbn: Book["isbn"];
  libraryId: Library["id"];
};
