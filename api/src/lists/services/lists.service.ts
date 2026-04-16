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
    const list = this.listsRepository.create({
      name: createListDto.name,
      owner: user,
    });

    return this.listsRepository.save(list);
  }

  public async findAllByUser(user: User): Promise<List[]> {
    return this.listsRepository.find({
      where: { owner: { id: user.id } },
      relations: ['items'],
    });
  }
}
