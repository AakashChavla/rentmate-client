import { z } from 'zod';
import { API_DEFAULT_URL } from '../config/app.constants';
const environmentSchema = z.object({ NEXT_PUBLIC_API_URL: z.url().default(API_DEFAULT_URL) });
export const environment = environmentSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
