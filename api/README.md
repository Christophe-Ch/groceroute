# API

This folder holds the actual Nest code.

## 🗄️ Database

The API uses TypeORM to connect to the Postgres database and handle relations between tables and code entities.

### 👤 Entities

Any object that lives in the database is defined by an entity (`.entity.ts`) file (e.g. [user.entity.ts](src/users/models/user.entity.ts)).

All entities must be registered under the [entities.ts](src/db/entities.ts) file, to be accessible by the `TypeOrmModule` as well as the `typeorm-ts-node-commonjs` CLI.

### ⚙️ Migrations

The following commands are available :
- Create an empty migration : `docker compose exec api npm run create-migration src/db/migrations/[MigrationName]`
- After creating / updating / deleting an entity : `docker compose exec api npm run generate-migration src/db/migrations/[MigrationName]`

## 👮‍♂️ Protecting routes

The `JwtAuthGuard` provides a way to enforce authentication either at the controller level or the route level, using the `UseGuards` decorator.

It also provides the connected `User` entity through the request object that can be injected via route function parameters. For type awareness, the `AuthenticatedRequest` type can be used for the `@Req() req` parameter.