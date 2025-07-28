import { Library } from "@interface/db/library";
import { Serial, Timestamp, Char, Varchar } from "./pg";
import { Useruser } from "./useruser";

export type RequestLibraryMembership = {
  id: Serial;
  time: Timestamp;
  status: Char;
  membershipRequestType: Varchar<10>;
  libraryId: Library["id"];
  userId: Useruser["id"];
};
