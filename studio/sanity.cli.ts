import { defineCliConfig } from 'sanity/cli';
import { resolve } from 'node:path';

try {
  process.loadEnvFile(resolve(process.cwd(), '../.env'));
} catch {
  try {
    process.loadEnvFile(resolve(process.cwd(), '.env'));
  } catch {
    // Ignore if .env is missing
  }
}

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID || '';

const dataset =
  process.env.SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  vite: (config) => ({
    ...config,
    envDir: resolve(process.cwd(), '..'),
    envPrefix: ['SANITY_STUDIO_', 'PUBLIC_'],
    define: {
      ...config.define,
      'process.env.PUBLIC_SANITY_PROJECT_ID': JSON.stringify(projectId),
      'process.env.PUBLIC_SANITY_DATASET': JSON.stringify(dataset),
      'process.env.SANITY_STUDIO_PROJECT_ID': JSON.stringify(projectId),
      'process.env.SANITY_STUDIO_DATASET': JSON.stringify(dataset),
    },
  }),
});
