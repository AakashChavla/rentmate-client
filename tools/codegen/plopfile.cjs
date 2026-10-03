module.exports = function configure(plop) {
  for (const kind of ['module', 'integration', 'processor']) {
    plop.setGenerator(kind, {
      description:
        'Generate a client interface, implementation, fake and test without inventing API routes',
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Name',
          validate: (name) => /^[a-z][a-z0-9-]*$/.test(name) || 'Use a lowercase kebab-case name',
        },
      ],
      actions: [
        {
          type: 'add',
          path: require('node:path').resolve(
            __dirname,
            '../..',
            'src/features/{{kebabCase name}}/types/{{kebabCase name}}.ts',
          ),
          template: 'export interface {{pascalCase name}}Port { ready(): boolean; }\n',
        },
        {
          type: 'add',
          path: require('node:path').resolve(
            __dirname,
            '../..',
            'src/features/{{kebabCase name}}/api/default-{{kebabCase name}}.ts',
          ),
          template:
            "import type { {{pascalCase name}}Port } from '../types/{{kebabCase name}}';\nexport class Default{{pascalCase name}} implements {{pascalCase name}}Port { public ready(): boolean { return true; } }\n",
        },
        {
          type: 'add',
          path: require('node:path').resolve(
            __dirname,
            '../..',
            'src/features/{{kebabCase name}}/tests/fake-{{kebabCase name}}.ts',
          ),
          template:
            "import type { {{pascalCase name}}Port } from '../types/{{kebabCase name}}';\nexport class Fake{{pascalCase name}} implements {{pascalCase name}}Port { public ready(): boolean { return false; } }\n",
        },
        {
          type: 'add',
          path: require('node:path').resolve(
            __dirname,
            '../..',
            'src/features/{{kebabCase name}}/tests/{{kebabCase name}}.test.ts',
          ),
          template:
            "import { describe, expect, it } from 'vitest';\nimport type { {{pascalCase name}}Port } from '../types/{{kebabCase name}}';\nimport { Fake{{pascalCase name}} } from './fake-{{kebabCase name}}';\ndescribe('port substitution', () => { it('accepts an injected fake', () => { const port: {{pascalCase name}}Port = new Fake{{pascalCase name}}(); expect(port.ready()).toBe(false); }); });\n",
        },
        {
          type: 'add',
          path: require('node:path').resolve(
            __dirname,
            '../..',
            'src/features/{{kebabCase name}}/index.ts',
          ),
          template: "export type { {{pascalCase name}}Port } from './types/{{kebabCase name}}';\n",
        },
      ],
    });
  }
};
