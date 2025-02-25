import Cookies from "cookies";
import { AladinAPI } from "../datasources/aladinAPI";
import { PGAPI } from "../datasources/pg-api";

export type DataSourceContext = {
  dataSources: {
    aladinAPI: AladinAPI;
    pgAPI: PGAPI;
  };
  userId: string;
  cookies: Cookies;
};
