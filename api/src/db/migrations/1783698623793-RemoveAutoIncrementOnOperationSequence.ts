import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAutoIncrementOnOperationSequence1783698623793
  implements MigrationInterface
{
  name = 'RemoveAutoIncrementOnOperationSequence1783698623793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "operations" ALTER COLUMN "sequence" DROP DEFAULT`,
    );
    await queryRunner.query(`DROP SEQUENCE "operations_sequence_seq"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "operations_sequence_seq" OWNED BY "operations"."sequence"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" ALTER COLUMN "sequence" SET DEFAULT nextval('"operations_sequence_seq"')`,
    );
  }
}
