import { GroceryList } from "./grocery-list";

export type StoredGroceryList = Omit<
  GroceryList,
  "createdAt" | "updatedAt" | "deletedAt" | "sessionCheckOrder"
> & {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  sessionCheckOrder: Record<string, string[]> | null;
};

export function toStored(list: GroceryList): StoredGroceryList {
  return {
    ...list,
    createdAt: list.createdAt.toString(),
    updatedAt: list.updatedAt.toString(),
    deletedAt: list.deletedAt?.toString(),
    sessionCheckOrder: list.sessionCheckOrder
      ? Object.fromEntries(
          Array.from(list.sessionCheckOrder, ([actorId, checkOrder]) => [
            actorId,
            Array.from(checkOrder),
          ]),
        )
      : null,
  };
}

export function fromStored(stored: StoredGroceryList): GroceryList {
  return {
    ...stored,
    createdAt: new Date(stored.createdAt),
    updatedAt: new Date(stored.updatedAt),
    deletedAt: stored.deletedAt ? new Date(stored.deletedAt) : null,
    sessionCheckOrder: stored.sessionCheckOrder
      ? new Map(
          Object.entries(stored.sessionCheckOrder).map(([actorId, order]) => [
            actorId,
            new Set(order),
          ]),
        )
      : null,
  };
}
