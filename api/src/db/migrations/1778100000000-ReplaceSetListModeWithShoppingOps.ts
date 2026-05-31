import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceSetListModeWithShoppingOps1778100000000
  implements MigrationInterface
{
  name = 'ReplaceSetListModeWithShoppingOps1778100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "operations" WHERE "type" = 'SET_LIST_MODE'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."operations_type_enum" RENAME TO "operations_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."operations_type_enum" AS ENUM('CREATE_LIST', 'START_SHOPPING', 'ABANDON_SHOPPING', 'DELETE_LIST', 'ADD_ITEM', 'ADD_PAST_ITEM', 'RENAME_ITEM', 'SET_ITEM_QUANTITY', 'CHECK_ITEM', 'UNCHECK_ITEM', 'DELETE_ITEM', 'REORDER_ITEMS', 'RENAME_LIST', 'FINISH_SHOPPING')`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" ALTER COLUMN "type" TYPE "public"."operations_type_enum" USING "type"::"text"::"public"."operations_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."operations_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "operations" WHERE "type" IN ('START_SHOPPING', 'ABANDON_SHOPPING')`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."operations_type_enum" RENAME TO "operations_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."operations_type_enum" AS ENUM('CREATE_LIST', 'SET_LIST_MODE', 'DELETE_LIST', 'ADD_ITEM', 'ADD_PAST_ITEM', 'RENAME_ITEM', 'SET_ITEM_QUANTITY', 'CHECK_ITEM', 'UNCHECK_ITEM', 'DELETE_ITEM', 'REORDER_ITEMS', 'RENAME_LIST', 'FINISH_SHOPPING')`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" ALTER COLUMN "type" TYPE "public"."operations_type_enum" USING "type"::"text"::"public"."operations_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."operations_type_enum_old"`);
  }
}
