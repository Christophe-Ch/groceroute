import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSetListModeOperationType1776455284238
  implements MigrationInterface
{
  name = 'AddSetListModeOperationType1776455284238';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."operations_type_enum" RENAME TO "operations_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."operations_type_enum" AS ENUM('CREATE_LIST', 'SET_LIST_MODE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" ALTER COLUMN "type" TYPE "public"."operations_type_enum" USING "type"::"text"::"public"."operations_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."operations_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."operations_type_enum_old" AS ENUM('CREATE_LIST')`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" ALTER COLUMN "type" TYPE "public"."operations_type_enum_old" USING "type"::"text"::"public"."operations_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."operations_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."operations_type_enum_old" RENAME TO "operations_type_enum"`,
    );
  }
}
