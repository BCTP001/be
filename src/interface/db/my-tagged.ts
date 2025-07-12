import { Book } from "@interface/db/book";
import { MyTag } from "@interface/db/my-tag";

export type MyTagged = {
  isbn: Book["isbn"];
  myTagId: MyTag["id"];
};
