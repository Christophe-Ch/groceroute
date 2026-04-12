export type GroceryItem = {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  updatedAt: Date;
  deletedAt: Date | null;
};
