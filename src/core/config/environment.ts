import { z } from 'zod';

const schema = z.object({ NEXT_PUBLIC_API_URL: z.url() });

export function parseEnvironment(input: Record<string, unknown>) {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error('Invalid NEXT_PUBLIC_API_URL');
  return result.data;
}
