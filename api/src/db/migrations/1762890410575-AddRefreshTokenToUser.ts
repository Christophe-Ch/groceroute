import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenToUser1762890410575 implements MigrationInterface {
  name = 'AddRefreshTokenToUser1762890410575';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token" uuid`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_5230070094e8135a3d763d90e75" UNIQUE ("refresh_token")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_5230070094e8135a3d763d90e75"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token"`);
  }
}
