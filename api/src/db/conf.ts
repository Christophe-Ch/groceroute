import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeCaseNamingStrategy } from './utils/snake-case-naming-strategy';

const isCompiled = __filename.endsWith('.js');

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  entities: [isCompiled ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [
    isCompiled ? 'dist/db/migrations/**/*.js' : 'src/db/migrations/**/*.ts',
  ],
  namingStrategy: new SnakeCaseNamingStrategy(),
});
