/* built-in types */
export { String, Int } from "./built-ins";
/* custom types */
export type Void = void;
export type Authority = "owner" | "manager" | "member";
export { WelcomePackage } from "./welcome-package";
export { RecommendBooksRequest, RecommendBookInfo } from "./ai-recommendation";
export {
  GetBookInfoRequest,
  Author,
  Ebook,
  Bookinfo,
  GetBookInfoItem,
} from "./book";
export { Feed } from "./feed";
export { LibraryWithAuthority } from "./library";
export { UpdateLikeBooksRequest, UpdateLikeBooksResponse } from "./like";
export {
  RecommendQueryType,
  RecommendBookListRequest,
} from "./recommend-book-list";
export { SearchOption } from "./search-books";
export {
  GetBooksInShelfRequest,
  UpdateShelfRequest,
  UpdateShelfResponse,
  CreateShelfRequest,
  CreateShelfResponse,
} from "./shelf";
export { User, UserWithAuthority } from "./user";

export * as GQL from ".";
