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
  participants: User[];

  @Column({ type: 'enum', enum: ['edit', 'play'], default: 'edit' })
  mode: 'edit' | 'play';
}
