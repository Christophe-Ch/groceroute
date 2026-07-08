import { Operation } from "@/store/operations/types/operation";
import { client } from "./client";

export const sync = async (operations: Operation[]) => {
  console.log(operations);
  await client.post("/sync/push", { operations });
};
