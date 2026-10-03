import type { NextConfig } from 'next';
import { parseEnvironment } from './src/core/config/environment';

parseEnvironment({ NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL });
const nextConfig: NextConfig = { output: 'standalone', poweredByHeader: false };
export default nextConfig;
