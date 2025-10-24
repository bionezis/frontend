import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone', // Enable standalone output for Docker
}; 

export default withNextIntl(nextConfig);
