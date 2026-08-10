import { GroceryItem } from "@/models/grocery";
import { Operation } from "./operation";

export type ReorderItemsOperation = Operation<{
  newItems: GroceryItem[];
}>;
