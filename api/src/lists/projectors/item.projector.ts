import { OperationType } from '@core/models/operation-type.enum';
import { Operation } from '@core/models/operation.entity';
import { OperationProjector } from '@core/projectors/operation-projector';
import { OperationsHandler } from '@core/services/operations.handler';
import { Item } from '@lists/models/item.entity';
import { AddItemOperation } from '@lists/operations/item/add-item.operation';
import { CheckItemOperation } from '@lists/operations/item/check-item.operation';
import { DeleteItemOperation } from '@lists/operations/item/delete-item.operation';
import { SetItemQuantityOperation } from '@lists/operations/item/set-item-quantity.operation';
import { UncheckItemOperation } from '@lists/operations/item/uncheck-item.operation';
import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ItemProjector extends OperationProjector {
  constructor(operationsHandler: OperationsHandler) {
    super(
      [
        OperationType.ADD_ITEM,
        OperationType.DELETE_ITEM,
        OperationType.CHECK_ITEM,
        OperationType.UNCHECK_ITEM,
        OperationType.SET_ITEM_QUANTITY,
      ],
      operationsHandler,
    );
  }

  public async handle(operation: Operation, manager: EntityManager) {
    const executor = new ItemProjectorExecutor(manager);

    switch (operation.type) {
      case OperationType.ADD_ITEM:
        await executor.addItem(operation as AddItemOperation);
        break;
      case OperationType.DELETE_ITEM:
        await executor.deleteItem(operation as DeleteItemOperation);
        break;
      case OperationType.CHECK_ITEM:
        await executor.checkItem(operation as CheckItemOperation);
        break;
      case OperationType.UNCHECK_ITEM:
        await executor.uncheckItem(operation as UncheckItemOperation);
        break;
      case OperationType.SET_ITEM_QUANTITY:
        await executor.setItemQuantity(operation as SetItemQuantityOperation);
        break;
    }
  }
}

class ItemProjectorExecutor {
  private readonly itemRepository: Repository<Item>;

  constructor(manager: EntityManager) {
    this.itemRepository = manager.getRepository(Item);
  }

  public async addItem(operation: AddItemOperation): Promise<void> {
    const {
      payload: { id, listId, name },
    } = operation;

    await this.itemRepository.insert({ id, listId, name });
  }

  public async deleteItem(operation: DeleteItemOperation): Promise<void> {
    const { itemId, listId } = operation.payload;

    await this.itemRepository.delete({
      id: itemId,
      listId,
    });
  }

  public async checkItem(operation: CheckItemOperation): Promise<void> {
    const { itemId, listId } = operation.payload;

    await this.itemRepository.update({ id: itemId, listId }, { checked: true });
  }

  public async uncheckItem(operation: UncheckItemOperation): Promise<void> {
    const { itemId, listId } = operation.payload;

    await this.itemRepository.update(
      { id: itemId, listId },
      { checked: false },
    );
  }

  public async setItemQuantity(
    operation: SetItemQuantityOperation,
  ): Promise<void> {
    const { itemId, listId, quantity } = operation.payload;

    await this.itemRepository.update({ id: itemId, listId }, { quantity });
  }
}
