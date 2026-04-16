import { User } from '@users/models/user.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Item } from './item.entity';

@Entity()
export class List {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => Item, (item) => item.list, { cascade: true })
  items: Item[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Exclude()
  owner: User;
}
