import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../models/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  public async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  public async create(email: string, password: string): Promise<User> {
    const user = this.usersRepository.create({
      email,
      password,
    });

    await this.usersRepository.save(user);

    return user;
  }

  public async update(user: User): Promise<void> {
    const { id, ...toUpdate } = user;
    await this.usersRepository.update({ id }, toUpdate);
  }
}
