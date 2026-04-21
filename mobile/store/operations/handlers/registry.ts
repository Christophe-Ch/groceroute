import { OperationType } from "../types/operation";
import { OperationHandler } from "./operation-handler";
import { addItemHandler } from "./add-item.handler";
import { addPastItemHandler } from "./add-past-item.handler";
import { createListHandler } from "./create-list.handler";
import { deleteItemHandler } from "./delete-item.handler";
import { deleteListHandler } from "./delete-list.handler";
import { finishShoppingHandler } from "./finish-shopping.handler";
import { renameListHandler } from "./rename-list.handler";
import { reorderItemsHandler } from "./reorder-items.handler";
import { setListModeHandler } from "./set-list-mode.handler";
import { updateItemHandler } from "./update-item.handler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const operationHandlers: Record<OperationType, OperationHandler<any, any>> = {
  [OperationType.CREATE_LIST]: createListHandler,
  [OperationType.SET_LIST_MODE]: setListModeHandler,
  [OperationType.DELETE_LIST]: deleteListHandler,
  [OperationType.ADD_ITEM]: addItemHandler,
  [OperationType.ADD_PAST_ITEM]: addPastItemHandler,
  [OperationType.UPDATE_ITEM]: updateItemHandler,
  [OperationType.DELETE_ITEM]: deleteItemHandler,
  [OperationType.REORDER_ITEMS]: reorderItemsHandler,
  [OperationType.RENAME_LIST]: renameListHandler,
  [OperationType.FINISH_SHOPPING]: finishShoppingHandler,
};
