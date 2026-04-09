import { GroceryItem } from "./grocery-item";
import { ItemDistance } from "./item-distance";

export type GroceryList = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  items: GroceryItem[];
  pastItems: GroceryItem[];
  distances: ItemDistance[];
};
