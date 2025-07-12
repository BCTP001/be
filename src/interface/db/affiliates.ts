import { GraphQLError } from "graphql";
import { GQL } from "@interface/graphql";
import { Useruser } from "./useruser";
import { Library } from "./library";

export type Authority =
  | typeof Authority.Owner
  | typeof Authority.Manager
  | typeof Authority.Member;

export namespace Authority {
  export const Owner = 0;
  export const Manager = 1;
  export const Member = 2;
  export function intoGql(authority: Authority): GQL.Authority {
    switch (authority) {
      case Owner:
        return "owner";
      case Manager:
        return "manager";
      case Member:
        return "member";
      default:
        throw new GraphQLError("INTERNAL SERVER ERROR", {
          extensions: {
            code: "500",
          },
        });
    }
  }
}

export type Affiliates = {
  libraryId: Library["id"];
  userId: Useruser["id"];
  authority: Authority;
};
