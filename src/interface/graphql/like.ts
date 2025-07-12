import { String } from ".";

export type UpdateLikeBooksRequest = {
  containList?: String[];
  excludeList?: String[];
};

export type UpdateLikeBooksResponse = {
  msg?: String;
};
