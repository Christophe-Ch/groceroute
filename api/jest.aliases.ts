import * as path from 'path';
import { pathsToModuleNameMapper } from 'ts-jest';
import * as ts from 'typescript';

/**
 * Builds a Jest `moduleNameMapper` from the `paths` aliases declared in
 * tsconfig.json, so the aliases only ever need to be declared in one place.
 *
 * @param prefix path from Jest's `rootDir` to the directory tsconfig's
 *   `baseUrl` points at (the api package root).
 */
export const aliasModuleNameMapper = (
  prefix: string,
): Record<string, string | string[]> => {
  const tsconfigPath = path.join(__dirname, 'tsconfig.json');
  const { config } = ts.readConfigFile(tsconfigPath, (file) =>
    ts.sys.readFile(file),
  ) as { config?: { compilerOptions?: { paths?: ts.MapLike<string[]> } } };

  const paths = config?.compilerOptions?.paths;
  if (!paths) {
    throw new Error(`No compilerOptions.paths found in ${tsconfigPath}`);
  }

  return pathsToModuleNameMapper(paths, { prefix });
};
