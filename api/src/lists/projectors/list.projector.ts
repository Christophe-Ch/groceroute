import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OperationType } from 'src/core/models/operation-type.enum';
import { Operation } from 'src/core/models/operation.entity';
import { Repository } from 'typeorm';
import { List } from '../models/list.entity';
import { CreateListOperation } from '../operations/create-list.operation';
import { SetListModeOperation } from '../operations/set-list-mode.operation';
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
      case OperationType.SET_LIST_MODE:
        await this.setMode(operation as SetListModeOperation);
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

  private async setMode(operation: SetListModeOperation): Promise<void> {
    const {
      actorId,
      payload: { id: listId, mode },
    } = operation;

    if (!(await this.listsService.isParticipant(listId, actorId))) return;
    await this.listsRepository.update({ id: listId }, { mode });
  }
}
