import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { List } from './list.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  quantity: string;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ default: false })
  checked: boolean;

  @Column({ default: false })
  isPast: boolean;

  @ManyToOne(() => List, (list) => list.items, { onDelete: 'CASCADE' })
  list: List;

  @Column()
  listId: string;
}
