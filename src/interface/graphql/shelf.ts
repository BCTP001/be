import { String, Int } from ".";

export type GetBooksInShelfRequest = {
  shelfName?: String;
};

export type UpdateShelfRequest = {
  containList?: String[];
  excludeList?: String[];
  shelfName?: String;
};

export type UpdateShelfResponse = {
  msg?: String;
  shelfName?: String;
};

export type CreateShelfRequest = {
  shelfName?: String;
  userId: Int;
};

export type CreateShelfResponse = {
  msg?: String;
};
