import Cookies from "cookies";
import { Aladin } from "@datasources/aladin";
import { DB } from "@datasources/db";

export type Context = {
  dataSources: {
    aladin: Aladin;
    db: DB;
  };
  userId: number;
  cookies: Cookies;
};
