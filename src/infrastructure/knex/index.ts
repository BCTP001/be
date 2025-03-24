import { BatchedSQLDataSourceProps } from "@nic-jennings/sql-datasource";
import { NodeEnv } from "@env";
import env from "@env";

type KnexConfig = BatchedSQLDataSourceProps["knexConfig"];

const {
  NODE_ENV,
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
} = env;

const knexConfigRecord: Record<NodeEnv, KnexConfig> = {
  development: {
    client: "pg",
    connection: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
  },
  production: undefined,
};

export default knexConfigRecord[NODE_ENV];
