import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from './item.entity';

@Entity()
export class Distance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  from: Item;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  to: Item;

  @Column()
  count: number;
}
