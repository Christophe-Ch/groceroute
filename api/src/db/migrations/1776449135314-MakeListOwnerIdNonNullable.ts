import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeListOwnerIdNonNullable1776449135314
  implements MigrationInterface
{
  name = 'MakeListOwnerIdNonNullable1776449135314';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lists" DROP CONSTRAINT "FK_eb962e2db9730b4e73dfb580861"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lists" ALTER COLUMN "owner_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "lists" ADD CONSTRAINT "FK_eb962e2db9730b4e73dfb580861" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lists" DROP CONSTRAINT "FK_eb962e2db9730b4e73dfb580861"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lists" ALTER COLUMN "owner_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "lists" ADD CONSTRAINT "FK_eb962e2db9730b4e73dfb580861" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
