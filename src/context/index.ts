import { IncomingMessage, ServerResponse } from "http";
import { AladinAPI } from "../datasources/aladinAPI";
import { PGAPI } from "../datasources/pg-api";

export type DataSourceContext = {
  dataSources: {
    aladinAPI: AladinAPI;
    pgAPI: PGAPI;
  };
  userId: string;
  res: ServerResponse<IncomingMessage>;
};
