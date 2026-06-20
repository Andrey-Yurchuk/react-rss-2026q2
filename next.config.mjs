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
  output: 'export',
  distDir: './dist',
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
