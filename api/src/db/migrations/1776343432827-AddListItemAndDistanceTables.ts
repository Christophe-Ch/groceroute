import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListItemAndDistanceTables1776343432827
  implements MigrationInterface
{
  name = 'AddListItemAndDistanceTables1776343432827';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "quantity" character varying NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "checked" boolean NOT NULL, "is_past" boolean NOT NULL, "list_id" uuid, CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "lists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "owner_id" uuid, CONSTRAINT "PK_268b525e9a6dd04d0685cb2aaaa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "distances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "count" integer NOT NULL, "from_id" uuid, "to_id" uuid, CONSTRAINT "PK_1bc713b1f9ebf7d1790039c11ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "items" ADD CONSTRAINT "FK_9e792fa954394e5285d07f1e2ee" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lists" ADD CONSTRAINT "FK_eb962e2db9730b4e73dfb580861" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "distances" ADD CONSTRAINT "FK_6e76d24d5fe8160687e345b5c5e" FOREIGN KEY ("from_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "distances" ADD CONSTRAINT "FK_a1dec43d135701be9767e459475" FOREIGN KEY ("to_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "distances" DROP CONSTRAINT "FK_a1dec43d135701be9767e459475"`,
    );
    await queryRunner.query(
      `ALTER TABLE "distances" DROP CONSTRAINT "FK_6e76d24d5fe8160687e345b5c5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lists" DROP CONSTRAINT "FK_eb962e2db9730b4e73dfb580861"`,
    );
    await queryRunner.query(
      `ALTER TABLE "items" DROP CONSTRAINT "FK_9e792fa954394e5285d07f1e2ee"`,
    );
    await queryRunner.query(`DROP TABLE "distances"`);
    await queryRunner.query(`DROP TABLE "lists"`);
    await queryRunner.query(`DROP TABLE "items"`);
  }
}
