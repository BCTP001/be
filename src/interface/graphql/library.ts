import { GQL } from ".";

export type LibraryWithAuthority = {
  id: GQL.Int;
  name: GQL.String;
  authority: GQL.Authority;
};
