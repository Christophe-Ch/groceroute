import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@users/models/user.entity';
import { Repository } from 'typeorm';
import { CreateListDto } from '../dto/create-list.dto';
import { List } from '../models/list.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
  ) {}

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
}
