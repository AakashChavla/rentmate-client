import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
export default withNextIntl({
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { cpus: 1, optimizePackageImports: ['radix-ui', 'lucide-react'] },
  async headers() {
    return [{ source: '/(.*)', headers: SECURITY_HEADERS }];
  },
});
