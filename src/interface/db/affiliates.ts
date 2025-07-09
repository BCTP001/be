import { Id as LibraryId } from "@interface/db/library";
import { Id as UserId } from "@interface/db/user";
export const OwnerAuthority = 0;
export const ManagerAuthority = 1;
export const MemberAuthority = 2;
export type Authority =
  | typeof OwnerAuthority
  | typeof ManagerAuthority
  | typeof MemberAuthority;
export function authorityIntoGql(authority: Authority): string {
  switch (authority) {
    case OwnerAuthority:
      return "owner";
    case ManagerAuthority:
      return "manager";
    case MemberAuthority:
      return "member";
    default:
      return null;
  }
}
export type Affiliates = {
  libraryId: LibraryId;
  userId: UserId;
  authority: Authority;
};
