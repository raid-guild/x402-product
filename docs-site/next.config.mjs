import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nextra from 'nextra';

const withNextra = nextra({
  staticImage: true,
  defaultShowCopyCode: true
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themeMdxComponents = path.join(
  __dirname,
  'mdx-components.js'
);

export default withNextra({
  reactStrictMode: true,
  webpack: config => {
    config.resolve.alias['next-mdx-import-source-file'] = themeMdxComponents;
    return config;
  },
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './mdx-components.js'
    }
  }
});
