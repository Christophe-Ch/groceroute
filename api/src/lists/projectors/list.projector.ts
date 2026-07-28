import { Injectable } from '@nestjs/common';
import { OperationType } from 'src/core/models/operation-type.enum';
import { Operation } from 'src/core/models/operation.entity';
import { EntityManager, Repository } from 'typeorm';
import { List } from '../models/list.entity';
import { AbandonShoppingOperation } from '../operations/abandon-shopping.operation';
import { CreateListOperation } from '../operations/create-list.operation';
import { DeleteListOperation } from '../operations/delete-list.operation';
import { FinishShoppingOperation } from '../operations/finish-shopping.operation';
import { StartShoppingOperation } from '../operations/start-shopping.operation';
import { ListsService } from '../services/lists.service';
import { OperationProjector } from '@core/projectors/operation-projector';
import { OperationsHandler } from '@core/services/operations.handler';

@Injectable()
export class ListProjector extends OperationProjector {
  constructor(
    private readonly listsService: ListsService,
    operationsHandler: OperationsHandler,
  ) {
    super(
      [
        OperationType.CREATE_LIST,
        OperationType.DELETE_LIST,
        OperationType.START_SHOPPING,
        OperationType.ABANDON_SHOPPING,
        OperationType.FINISH_SHOPPING,
      ],
      operationsHandler,
    );
  }

  public async handle(
    operation: Operation,
    manager: EntityManager,
  ): Promise<void> {
    const executor = new ListProjectorExecutor(manager, this.listsService);

    switch (operation.type) {
      case OperationType.CREATE_LIST:
        await executor.create(operation as CreateListOperation);
        break;
      case OperationType.DELETE_LIST:
        await executor.delete(operation as DeleteListOperation);
        break;
      case OperationType.START_SHOPPING:
        await executor.startShopping(operation as StartShoppingOperation);
        break;
      case OperationType.ABANDON_SHOPPING:
        await executor.abandonShopping(operation as AbandonShoppingOperation);
        break;
      case OperationType.FINISH_SHOPPING:
        await executor.finishShopping(operation as FinishShoppingOperation);
        break;
    }
  }
}

class ListProjectorExecutor {
  private readonly listsRepository: Repository<List>;

  constructor(
    manager: EntityManager,
    private listsService: ListsService,
  ) {
    this.listsRepository = manager.getRepository(List);
    this.listsService = this.listsService.withTransaction(manager);
  }

  public async create(operation: CreateListOperation): Promise<void> {
    const {
      actorId,
      payload: { listId, name },
    } = operation;

    if (await this.listsRepository.existsBy({ id: listId })) return;

    await this.listsRepository.insert({ id: listId, name });
    await this.listsService.addParticipant(listId, actorId);
  }

  public async delete({
    payload: { listId },
  }: DeleteListOperation): Promise<void> {
    await this.listsRepository.delete({ id: listId });
  }

  public async startShopping(operation: StartShoppingOperation): Promise<void> {
    const {
      actorId,
      payload: { listId },
    } = operation;
    if (!(await this.listsService.isParticipant(listId, actorId))) return;
    await this.listsRepository.update({ id: listId }, { mode: 'play' });
  }

  public async abandonShopping(
    operation: AbandonShoppingOperation,
  ): Promise<void> {
    const {
      actorId,
      payload: { listId },
    } = operation;
    if (!(await this.listsService.isParticipant(listId, actorId))) return;
    await this.listsRepository.update({ id: listId }, { mode: 'edit' });
  }

  public async finishShopping(
    operation: FinishShoppingOperation,
  ): Promise<void> {
    const {
      actorId,
      payload: { listId },
    } = operation;
    if (!(await this.listsService.isParticipant(listId, actorId))) return;
    await this.listsRepository.update({ id: listId }, { mode: 'edit' });
  }
}
