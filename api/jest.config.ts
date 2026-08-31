import type { Config } from 'jest';
import { aliasModuleNameMapper } from './jest.aliases';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: aliasModuleNameMapper('<rootDir>/../'),
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
};

export default config;
