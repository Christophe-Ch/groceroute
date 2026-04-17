import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActorIdAndSequenceToOperation1776449627898 implements MigrationInterface {
    name = 'AddActorIdAndSequenceToOperation1776449627898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operations" ADD "actor_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "operations" ADD "sequence" BIGSERIAL NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_641ccf8fe0d911ecf66ae4acbf" ON "operations" ("sequence") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_641ccf8fe0d911ecf66ae4acbf"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "sequence"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "actor_id"`);
    }

}
