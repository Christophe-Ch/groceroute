import { GroceryItem } from "@/models/grocery";
import { Operation } from "./operation";

export type AddPastItemOperation = Operation<{
  listId: string;
  item: GroceryItem;
}>;
