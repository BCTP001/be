import { Isbn } from "@interface/db/book";
import { Id as LibraryId } from "@interface/db/library";
export type Provides = {
  isbn: Isbn;
  libraryId: LibraryId;
};
