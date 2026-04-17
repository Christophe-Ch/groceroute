import { MigrationInterface, QueryRunner } from "typeorm";

export class AddListMode1776454511398 implements MigrationInterface {
    name = 'AddListMode1776454511398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."lists_mode_enum" AS ENUM('edit', 'play')`);
        await queryRunner.query(`ALTER TABLE "lists" ADD "mode" "public"."lists_mode_enum" NOT NULL DEFAULT 'edit'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lists" DROP COLUMN "mode"`);
        await queryRunner.query(`DROP TYPE "public"."lists_mode_enum"`);
    }

}
