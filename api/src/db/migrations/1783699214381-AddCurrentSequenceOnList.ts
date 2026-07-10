import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrentSequenceOnList1783699214381
  implements MigrationInterface
{
  name = 'AddCurrentSequenceOnList1783699214381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lists" ADD "current_sequence" bigint NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lists" DROP COLUMN "current_sequence"`,
    );
  }
}
