import { GroceryItem } from "@/models/grocery";
import { Operation } from "./operation";

export type ReorderItemsOperation = Operation<{
  listId: string;
  newItems: GroceryItem[];
}>;
