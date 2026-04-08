import { GroceryItem } from "./grocery-item";

export type GroceryList = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  items: GroceryItem[];
};