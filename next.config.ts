import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude pdfkit from bundling optimization - works with both webpack and turbopack
  serverExternalPackages: ['pdfkit'],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle pdfkit font files for webpack builds
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfkit': 'pdfkit/js/pdfkit.standalone.js',
      };
    }
    return config;
  },
};

export default nextConfig;
