import { Serial, Varchar, Text } from "./pg";

export type Useruser = {
  id: Serial;
  username: Varchar<40>;
  name: Varchar<50>;
  profilePic: Varchar<100>;
  bio: Varchar<80>;
  hashedPw: Text;
};
