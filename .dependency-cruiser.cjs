module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-unresolved',
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: 'no-deep-feature-imports',
      severity: 'error',
      from: {
        path: '^src/features/([^/]+)/',
      },
      to: {
        path: '^src/features/',
        pathNot: '^src/features/($1/|[^/]+/index\\.ts$)',
      },
    },
    {
      name: 'features-no-app',
      severity: 'error',
      from: {
        path: '^src/features/',
      },
      to: {
        path: '^src/app/',
      },
    },
    {
      name: 'ui-no-features',
      severity: 'error',
      from: {
        path: '^src/components/ui/',
      },
      to: {
        path: '^src/features/',
      },
    },
  ],
  options: {
    tsPreCompilationDeps: true,
    doNotFollow: {
      path: 'node_modules',
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      extensions: ['.ts', '.tsx', '.d.ts', '.js', '.json'],
      conditionNames: ['types', 'react-server', 'import', 'require', 'node', 'default'],
    },
  },
};
