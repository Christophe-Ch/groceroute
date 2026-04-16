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

  @Column()
  quantity: string;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column()
  checked: boolean;

  @Column()
  isPast: boolean;

  @ManyToOne(() => List, (list) => list.items, { onDelete: 'CASCADE' })
  list: List;
}
