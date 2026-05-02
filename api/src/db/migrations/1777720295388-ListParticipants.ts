import { MigrationInterface, QueryRunner } from 'typeorm';

export class ListParticipants1777720295388 implements MigrationInterface {
  name = 'ListParticipants1777720295388';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lists" DROP CONSTRAINT "FK_eb962e2db9730b4e73dfb580861"`,
    );
    await queryRunner.query(
      `CREATE TABLE "list_participants" ("list_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_8993e0e932a3a26dc95732ce6c8" PRIMARY KEY ("list_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_419110f862cd68cc4c71ecbbad" ON "list_participants" ("list_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d8ff0446b2dd3e5d3537a1e7f4" ON "list_participants" ("user_id") `,
    );
    await queryRunner.query(
      `INSERT INTO "list_participants" (list_id, user_id) SELECT id, owner_id FROM "lists" WHERE owner_id IS NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "lists" DROP COLUMN "owner_id"`);
    await queryRunner.query(
      `ALTER TABLE "list_participants" ADD CONSTRAINT "FK_419110f862cd68cc4c71ecbbad1" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_participants" ADD CONSTRAINT "FK_d8ff0446b2dd3e5d3537a1e7f47" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "list_participants" DROP CONSTRAINT "FK_d8ff0446b2dd3e5d3537a1e7f47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_participants" DROP CONSTRAINT "FK_419110f862cd68cc4c71ecbbad1"`,
    );
    await queryRunner.query(`ALTER TABLE "lists" ADD "owner_id" uuid`);
    await queryRunner.query(
      `UPDATE "lists" l SET owner_id = (SELECT user_id FROM "list_participants" lp WHERE lp.list_id = l.id LIMIT 1)`,
    );
    await queryRunner.query(
      `ALTER TABLE "lists" ALTER COLUMN "owner_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d8ff0446b2dd3e5d3537a1e7f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_419110f862cd68cc4c71ecbbad"`,
    );
    await queryRunner.query(`DROP TABLE "list_participants"`);
    await queryRunner.query(
      `ALTER TABLE "lists" ADD CONSTRAINT "FK_eb962e2db9730b4e73dfb580861" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
