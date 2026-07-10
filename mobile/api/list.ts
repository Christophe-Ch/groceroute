import { client } from "./client";

export const join = async (listId: string) => {
  await client.post(`/lists/${listId}/join`);
};
