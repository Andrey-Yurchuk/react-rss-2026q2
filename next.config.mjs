import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
function normalizeBasePath(value) {
  if (!value || value.trim() === '') {
    return '';
  }

  const trimmed = value.replace(/\/$/, '');

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

const nextConfig = {
  distDir: './dist',
  ...(process.env.NEXT_STATIC_EXPORT === '1' ? { output: 'export' } : {}),
  ...(basePath ? { basePath } : {}),
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
