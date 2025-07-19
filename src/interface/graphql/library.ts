import { GQL } from ".";

export type LibraryWithAuthority = {
  id: GQL.Int;
  name: GQL.String;
  authority: GQL.Authority;
};

export interface RequestItem {
  id: number;
  time: string;
  status: string;
  requestType: string;
  isbn: string;
  userId: number;
}
