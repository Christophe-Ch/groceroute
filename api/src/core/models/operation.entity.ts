import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';
import { OperationType } from './operation-type.enum';

@Entity()
export class Operation<T = { listId: string } & Record<string, any>> {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'enum', enum: OperationType })
  type: OperationType;

  @Column('uuid')
  actorId: string;

  @Column('jsonb')
  payload: T;

  @Index()
  @Column({ type: 'bigint' })
  sequence: string;

  @CreateDateColumn()
  createdAt: Date;
}
