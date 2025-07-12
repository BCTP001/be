import { Varchar, Serial } from "./pg";
import { Useruser } from "./useruser";

export type Shelf = {
  id: Serial;
  name: Varchar<20>;
  userId: Useruser["id"];
};
