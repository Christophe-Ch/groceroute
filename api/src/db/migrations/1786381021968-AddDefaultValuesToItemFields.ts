import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultValuesToItemFields1786381021968
  implements MigrationInterface
{
  name = 'AddDefaultValuesToItemFields1786381021968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "items" ALTER COLUMN "quantity" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "items" ALTER COLUMN "checked" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "items" ALTER COLUMN "is_past" SET DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "items" ALTER COLUMN "is_past" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "items" ALTER COLUMN "checked" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "items" ALTER COLUMN "quantity" DROP DEFAULT`,
    );
  }
}
