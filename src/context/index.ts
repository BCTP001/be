import { MySQLAPI } from "../datasources/mysql-api";

export type DataSourceContext = {
  dataSources: {
    mySQLAPI: MySQLAPI
  };
}
