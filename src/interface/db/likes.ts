import { Book } from "./book";
import { Useruser } from "./useruser";

export type Likes = {
  userId: Useruser["id"];
  isbn: Book["isbn"];
};
