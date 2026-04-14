import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeCaseNamingStrategy } from './utils/snake-case-naming-strategy';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/db/migrations/**/*{.ts,.js}'],
  namingStrategy: new SnakeCaseNamingStrategy(),
});
