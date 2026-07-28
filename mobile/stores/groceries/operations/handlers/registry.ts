import { OperationType } from "../types/operation";
import { OperationHandler } from "./operation-handler";
import { abandonShoppingHandler } from "./abandon-shopping.handler";
import { addItemHandler } from "./add-item.handler";
import { addPastItemHandler } from "./add-past-item.handler";
import { checkItemHandler } from "./check-item.handler";
import { createListHandler } from "./create-list.handler";
import { deleteItemHandler } from "./delete-item.handler";
import { deleteListHandler } from "./delete-list.handler";
import { finishShoppingHandler } from "./finish-shopping.handler";
import { renameItemHandler } from "./rename-item.handler";
import { renameListHandler } from "./rename-list.handler";
import { reorderItemsHandler } from "./reorder-items.handler";
import { setItemQuantityHandler } from "./set-item-quantity.handler";
import { startShoppingHandler } from "./start-shopping.handler";
import { uncheckItemHandler } from "./uncheck-item.handler";
import { addParticipantHandler } from "./add-participant.handler";

export const operationHandlers: Record<
  OperationType,
  OperationHandler<any, any>
> = {
  [OperationType.CREATE_LIST]: createListHandler,
  [OperationType.START_SHOPPING]: startShoppingHandler,
  [OperationType.ABANDON_SHOPPING]: abandonShoppingHandler,
  [OperationType.DELETE_LIST]: deleteListHandler,
  [OperationType.ADD_ITEM]: addItemHandler,
  [OperationType.ADD_PAST_ITEM]: addPastItemHandler,
  [OperationType.RENAME_ITEM]: renameItemHandler,
  [OperationType.SET_ITEM_QUANTITY]: setItemQuantityHandler,
  [OperationType.CHECK_ITEM]: checkItemHandler,
  [OperationType.UNCHECK_ITEM]: uncheckItemHandler,
  [OperationType.DELETE_ITEM]: deleteItemHandler,
  [OperationType.REORDER_ITEMS]: reorderItemsHandler,
  [OperationType.RENAME_LIST]: renameListHandler,
  [OperationType.FINISH_SHOPPING]: finishShoppingHandler,
  [OperationType.ADD_PARTICIPANT]: addParticipantHandler,
};
