import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { OperationType } from './operation-type.enum';

@Entity()
export class Operation<T = Record<string, any>> {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'enum', enum: OperationType })
  type: OperationType;

  @Column('uuid')
  actorId: string;

  @Column('jsonb')
  payload: T;

  @Index()
  @Column({ type: 'bigint', generated: 'increment' })
  sequence: number;
}
