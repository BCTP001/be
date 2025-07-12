import { Serial, Varchar } from "./pg";

export type Library = {
  id: Serial;
  name: Varchar<20>;
};
