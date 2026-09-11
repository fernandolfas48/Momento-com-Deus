/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  outputFileTracingRoot: process.env.NEXT_OUTPUT_MODE ? path.join(__dirname, '../') : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  // Prisma Client deve ser tratado como pacote externo (não bundled pelo Turbopack)
  // para evitar o erro 'Cannot find module @prisma/client-<hash>' em funções serverless
  serverExternalPackages: ['@prisma/client', 'prisma'],
  allowedDevOrigins: ['127.0.0.1', '1516ea39fd.na111.preview.abacusai.app'],
};

const fs = require('fs');
const userConfigPath = path.join(__dirname, 'next.config.user.json');
const userConfigAllowedKeys = { skipTrailingSlashRedirect: 'boolean', trailingSlash: 'boolean' };
if (fs.existsSync(userConfigPath)) {
  const userConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));
  for (const key of Object.keys(userConfig)) {
    if (typeof userConfig[key] !== userConfigAllowedKeys[key]) {
      throw new Error(`next.config.user.json: unsupported override "${key}". Supported boolean keys: skipTrailingSlashRedirect, trailingSlash.`);
    }
    nextConfig[key] = userConfig[key];
  }
}

module.exports = nextConfig;
