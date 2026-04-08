export type GroceryItem = {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
  updatedAt: Date;
  deletedAt: Date | null;
};
