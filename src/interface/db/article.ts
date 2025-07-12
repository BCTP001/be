import { Serial, Varchar } from "./pg";
import { Useruser } from "./useruser";
import { Book } from "./book";

export type Article = {
  id: Serial;
  title: Varchar<100>;
  content: Varchar<3000>;
  userId: Useruser["id"];
  isbn: Book["isbn"];
};
