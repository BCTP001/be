import { Placeholder } from "../types/generated"

import { BatchedSQLDataSource } from "@nic-jennings/sql-datasource"

export class MySQLAPI extends BatchedSQLDataSource {
  async getPlaceholder(): Promise<Placeholder> {
    return { number: 123 }
  }
}
