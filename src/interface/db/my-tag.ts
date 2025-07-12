import { Useruser } from "@interface/db/useruser";
import { Serial, Varchar } from "./pg";

export type MyTag = {
  id: Serial;
  name: Varchar<10>;
  userId: Useruser["id"];
};
