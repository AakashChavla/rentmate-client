export interface ArchitectureProof {
  name: string;
  files: Record<string, string>;
}
export const ARCHITECTURE_PROOFS: ArchitectureProof[] = [
  {
    name: 'no-circular',
    files: {
      'src/proof/a.ts': "import { b } from './b'; export const a = b;",
      'src/proof/b.ts': "import { a } from './a'; export const b = a;",
    },
  },
  {
    name: 'no-unresolved',
    files: { 'src/proof/unresolved.ts': "export { absent } from './absent';" },
  },
  {
    name: 'no-deep-feature-imports',
    files: {
      'src/features/proofa/a.ts': "export { b } from '../proofb/internal';",
      'src/features/proofb/internal.ts': 'export const b = true;',
    },
  },
  {
    name: 'features-no-app',
    files: {
      'src/features/proof/a.ts': "export { item } from '../../app/proof';",
      'src/app/proof.ts': 'export const item = true;',
    },
  },
  {
    name: 'ui-no-features',
    files: {
      'src/components/ui/Proof.ts': "export { item } from '../../features/proof/index';",
      'src/features/proof/index.ts': 'export const item = true;',
    },
  },
];
