import { Serial, Int, Varchar } from "./pg";
import { Useruser } from "./useruser";
import { Book } from "./book";

export type Review = {
  id: Serial;
  rating: Int;
  content?: Varchar<500>;
  userId: Useruser["id"];
  isbn: Book["isbn"];
};
