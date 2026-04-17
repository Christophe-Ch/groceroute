import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOperationsTable1776447608530 implements MigrationInterface {
  name = 'AddOperationsTable1776447608530';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."operations_type_enum" AS ENUM('CREATE_LIST')`,
    );
    await queryRunner.query(
      `CREATE TABLE "operations" ("id" character varying NOT NULL, "type" "public"."operations_type_enum" NOT NULL, "payload" jsonb NOT NULL, CONSTRAINT "PK_7b62d84d6f9912b975987165856" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "operations"`);
    await queryRunner.query(`DROP TYPE "public"."operations_type_enum"`);
  }
}
