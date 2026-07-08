import { Operation } from "@/store/operations/types/operation";
import { client } from "./client";

export const sync = async (operations: Operation[]) => {
  await client.post("/sync/push", { operations });
};
