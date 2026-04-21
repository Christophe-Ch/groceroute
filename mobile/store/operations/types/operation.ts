export enum OperationType {
  CREATE_LIST = "CREATE_LIST",
  SET_LIST_MODE = "SET_LIST_MODE",
  DELETE_LIST = "DELETE_LIST",
  ADD_ITEM = "ADD_ITEM",
  ADD_PAST_ITEM = "ADD_PAST_ITEM",
  UPDATE_ITEM = "UPDATE_ITEM",
  DELETE_ITEM = "DELETE_ITEM",
  REORDER_ITEMS = "REORDER_ITEMS",
  RENAME_LIST = "RENAME_LIST",
  FINISH_SHOPPING = "FINISH_SHOPPING",
}

export type Operation<T = Record<string, any>> = {
  id: string;
  type: OperationType;
  actorId: string;
  payload: T;
  sequence: number;
};
