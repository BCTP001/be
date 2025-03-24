import dotenv from "dotenv";

function getEnv(name: string) {
  return process.env[name];
}

function castEnv<EnumT>(name: string, defaultValue: EnumT) {
  const configured = getEnv(name);
  if (configured === undefined) {
    return defaultValue;
  } else {
    return configured as EnumT;
  }
}

dotenv.config({ path: ".env" });

export type NodeEnv = "development" | "production";
const DefaultNodeEnv: NodeEnv = "development";
const NODE_ENV: NodeEnv = castEnv<NodeEnv>("NODE_ENV", DefaultNodeEnv);

type PostgresHost = string;
const POSTGRES_HOST: PostgresHost = getEnv("POSTGRES_HOST");

type PostgresDB = string;
const POSTGRES_DB: PostgresDB = getEnv("POSTGRES_DB");

type PostgresPort = string;
const POSTGRES_PORT: PostgresPort = getEnv("POSTGRES_PORT");

type PostgresUser = string;
const POSTGRES_USER: PostgresUser = getEnv("POSTGRES_USER");

type PostgresPassword = string;
const POSTGRES_PASSWORD: PostgresPassword = getEnv("POSTGRES_PASSWORD");

export default {
  NODE_ENV,
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
};
