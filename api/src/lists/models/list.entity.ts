import { User } from '@users/models/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { Participant } from './participant';

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

  @ManyToMany(() => User)
  @JoinTable({
    name: 'list_participants',
    joinColumn: { name: 'list_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  participants: Participant[];

  @Column({ type: 'enum', enum: ['edit', 'play'], default: 'edit' })
  mode: 'edit' | 'play';

  @Column({ default: 0, type: 'bigint' })
  currentSequence: number;
}
