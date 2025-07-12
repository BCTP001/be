import { GQL } from ".";

export type User = {
  id: GQL.Int;
  username: GQL.String;
  name: GQL.String;
  profilePic?: GQL.String;
  bio?: GQL.String;
};

export type UserWithAuthority = {
  user: User;
  authority: GQL.Authority;
};
