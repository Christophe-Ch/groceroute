import { GroceryItem } from "@/models/grocery";
import { Operation } from "./operation";

export type UpdateItemOperation = Operation<{
  listId: string;
  itemId: string;
  updatedItem: Partial<GroceryItem>;
}>;
