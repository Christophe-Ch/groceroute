import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@users/models/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateListDto } from '../dto/create-list.dto';
import { List } from '../models/list.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
  ) {}

  public withTransaction(manager: EntityManager): ListsService {
    return new ListsService(manager.getRepository(List));
  }

  public async create(createListDto: CreateListDto, user: User): Promise<List> {
    const list = await this.listsRepository.save(
      this.listsRepository.create({ name: createListDto.name }),
    );
    await this.addParticipant(list.id, user.id);
    return list;
  }

  public async findAllByUser(user: User): Promise<List[]> {
    return this.listsRepository.find({
      where: { participants: { id: user.id } },
      relations: ['items'],
    });
  }

  public async addParticipant(listId: string, userId: string): Promise<void> {
    if (!(await this.listsRepository.existsBy({ id: listId }))) {
      throw new NotFoundException(`No list found for id ${listId}`);
    }

    await this.listsRepository
      .createQueryBuilder()
      .relation(List, 'participants')
      .of(listId)
      .add(userId);
  }

  public async isParticipant(listId: string, userId: string): Promise<boolean> {
    const count = await this.listsRepository.count({
      where: { id: listId, participants: { id: userId } },
    });
    return count > 0;
  }

  public async getParticipantIds(listId: string): Promise<string[]> {
    const participants = await this.listsRepository
      .createQueryBuilder()
      .relation(List, 'participants')
      .of(listId)
      .loadMany<User>();

    return participants.map((p) => p.id);
  }

  public async getListCurrentSequence(listId: string): Promise<string> {
    const result = await this.listsRepository
      .createQueryBuilder('list')
      .select('list.currentSequence', 'currentSequence')
      .where('list.id = :listId', { listId })
      .getRawOne<{ currentSequence: string }>();

    if (!result) {
      throw new Error('List not found');
    }

    return result.currentSequence;
  }
}
