export type Id = number;
export type Name = string;
export type Library = {
  id: Id;
  name: Name;
};
import { Authority, authorityIntoGql } from "@interface/db/affiliates";
export type LibraryWithAuthority = {
  id: Id;
  name: Name;
  authority: Authority;
};
import { LibraryWithAuthority as GqlLibraryWithAuthority } from "@interface/graphql";
export function libraryWithAuthorityIntoGql(
  src: LibraryWithAuthority,
): GqlLibraryWithAuthority {
  return {
    id: String(src.id),
    name: src.name,
    authority: authorityIntoGql(src.authority),
  };
}
