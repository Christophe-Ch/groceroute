import { GroceryItem } from "./grocery-item";
import { ItemDistance } from "./item-distance";
import { Participant } from "./participant";

export type SessionCheckOrder = Map<string, Set<string>>;

export type GroceryList = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  items: GroceryItem[];
  pastItems: GroceryItem[];
  distances: ItemDistance[];
  mode: "edit" | "play";
  currentSequence: number;
  participants: Participant[];
  sessionCheckOrder: SessionCheckOrder | null;
};
