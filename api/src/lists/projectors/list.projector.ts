import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OperationType } from 'src/core/models/operation-type.enum';
import { Operation } from 'src/core/models/operation.entity';
import { Repository } from 'typeorm';
import { List } from '../models/list.entity';
import { CreateListOperation } from '../operations/create-list.operation';
import { SetListModeOperation } from '../operations/set-list-mode.operation';

@Injectable()
export class ListProjector {
  constructor(
    @InjectRepository(List) private readonly listsRepository: Repository<List>,
  ) {}

  public async handle(operation: Operation): Promise<void> {
    switch (operation.type) {
      case OperationType.CREATE_LIST:
        await this.create(operation as Operation<CreateListOperation>);
        break;
      case OperationType.SET_LIST_MODE:
        await this.setMode(operation as Operation<SetListModeOperation>);
        break;
    }
  }

  private async create(
    operation: Operation<CreateListOperation>,
  ): Promise<void> {
    const {
      actorId,
      payload: { id: listId, name },
    } = operation;

    if (await this.listsRepository.existsBy({ id: listId })) return;

    await this.listsRepository.insert({
      id: listId,
      name: name,
      ownerId: actorId,
    });
  }

  private async setMode(
    operation: Operation<SetListModeOperation>,
  ): Promise<void> {
    const {
      actorId,
      payload: { id: listId, mode },
    } = operation;

    await this.listsRepository.update(
      { id: listId, ownerId: actorId },
      { mode },
    );
  }
}
