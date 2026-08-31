import type { Config } from 'jest';
import { aliasModuleNameMapper } from '../jest.aliases';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: aliasModuleNameMapper('<rootDir>/'),
};

export default config;
