import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OperationType } from 'src/core/models/operation-type.enum';
import { Operation } from 'src/core/models/operation.entity';
import { Repository } from 'typeorm';
import { List } from '../models/list.entity';
import { AbandonShoppingOperation } from '../operations/abandon-shopping.operation';
import { CreateListOperation } from '../operations/create-list.operation';
import { DeleteListOperation } from '../operations/delete-list.operation';
import { FinishShoppingOperation } from '../operations/finish-shopping.operation';
import { StartShoppingOperation } from '../operations/start-shopping.operation';
import { ListsService } from '../services/lists.service';

@Injectable()
export class ListProjector {
  constructor(
    @InjectRepository(List) private readonly listsRepository: Repository<List>,
    private readonly listsService: ListsService,
  ) {}

  public async handle(operation: Operation): Promise<void> {
    switch (operation.type) {
      case OperationType.CREATE_LIST:
        await this.create(operation as CreateListOperation);
        break;
      case OperationType.DELETE_LIST:
        await this.delete(operation as DeleteListOperation);
        break;
      case OperationType.START_SHOPPING:
        await this.startShopping(operation as StartShoppingOperation);
        break;
      case OperationType.ABANDON_SHOPPING:
        await this.abandonShopping(operation as AbandonShoppingOperation);
        break;
      case OperationType.FINISH_SHOPPING:
        await this.finishShopping(operation as FinishShoppingOperation);
        break;
    }
  }

  private async create(operation: CreateListOperation): Promise<void> {
    const {
      actorId,
      payload: { id: listId, name },
    } = operation;

    if (await this.listsRepository.existsBy({ id: listId })) return;

    await this.listsRepository.insert({ id: listId, name });
    await this.listsService.addParticipant(listId, actorId);
  }

  private async delete({
    payload: { id },
  }: DeleteListOperation): Promise<void> {
    await this.listsRepository.delete({ id });
  }

  private async startShopping(
    operation: StartShoppingOperation,
  ): Promise<void> {
    const {
      actorId,
      payload: { listId },
    } = operation;
    if (!(await this.listsService.isParticipant(listId, actorId))) return;
    await this.listsRepository.update({ id: listId }, { mode: 'play' });
  }

  private async abandonShopping(
    operation: AbandonShoppingOperation,
  ): Promise<void> {
    const {
      actorId,
      payload: { listId },
    } = operation;
    if (!(await this.listsService.isParticipant(listId, actorId))) return;
    await this.listsRepository.update({ id: listId }, { mode: 'edit' });
  }

  private async finishShopping(
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
