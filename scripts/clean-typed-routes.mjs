import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const file = join(process.cwd(), '.expo', 'types', 'router.d.ts');
let out = readFileSync(file, 'utf8');

const objectEntry = / \| \{ pathname: `\/\.\.\/[^`]*`; params\?: Router\.Unknown(Input|Output)Params; \}/g;
const hrefEntry =
  / \| `\/\.\.\/[^`]+\$\{`\?\$\{string\}` \| `#\$\{string\}` \| ''}\`/g;

out = out
  .replace(objectEntry, '')
  .replace(hrefEntry, '')
  .replace(/\$\{'\/\((onboarding|tabs)\)'\}\/index/g, "$${'/($1)'}")
  .replace(/`\/index\$\{/g, '`/${')
  .replace(/`\/index`/g, '`/`');

writeFileSync(file, out, 'utf8');

const remaining = (out.match(/\/\.\.\//g) ?? []).length;
console.log(`clean-typed-routes: stripped non-route entries, ${remaining} remaining, normalized group indexes`);