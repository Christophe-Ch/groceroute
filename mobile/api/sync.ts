import { Operation } from "@/store/operations/types/operation";
import { client } from "./client";

export const push = async (operations: Operation[]) => {
  await client.post("/sync/push", { operations });
};

export const pull = async (listId: string, lastSequence: number) => {
  const { data } = await client.get<{
    operations: Operation[];
    currentSequence: number;
  }>("/sync/pull", { params: { listId, lastSequence } });

  return data;
};
