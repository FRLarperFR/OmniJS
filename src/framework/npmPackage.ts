/**
 * OmniJS Standalone NPM Package & GitHub Actions Publishing Hub
 * Generates ready-to-publish NPM repository files for GitHub Releases
 */

export interface NpmPackageFile {
  path: string;
  content: string;
}

export function generateNpmPackageFiles(): NpmPackageFile[] {
  return [
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: 'omnijsfw',
          version: '1.0.0',
          description: 'The all-in-one full-stack JavaScript framework with unified .omni multi-block format',
          type: 'module',
          main: './dist/index.js',
          types: './dist/index.d.ts',
          bin: {
            omni: './bin/omni.js',
          },
          scripts: {
            build: 'tsc && esbuild src/index.ts --bundle --platform=node --outdir=dist',
            test: 'node bin/omni.js test',
            prepublishOnly: 'npm run build && npm test',
          },
          keywords: [
            'omni',
            'omnijsfw',
            'full-stack',
            'framework',
            'reactivity',
            'rpc',
            'schema',
            'ast',
            'compiler',
          ],
          author: 'OmniJS Team <team@omni.js>',
          license: 'MIT',
          repository: {
            type: 'git',
            url: 'https://github.com/omnijsfw/omni.git',
          },
          engines: {
            node: '>=18.0.0',
          },
        },
        null,
        2
      ),
    },
    {
      path: 'bin/omni.js',
      content: `#!/usr/bin/env node
/**
 * OmniJS CLI Executable
 * SPDX-License-Identifier: MIT
 */

import { executeCli } from '../dist/cli.js';

const args = process.argv.slice(2);
executeCli(args).then((code) => {
  process.exit(code || 0);
}).catch((err) => {
  console.error('\\x1b[31m[OmniJS Fatal]:\\x1b[0m', err.message);
  process.exit(1);
});
`,
    },
    {
      path: '.github/workflows/publish.yml',
      content: `name: Publish to NPM

on:
  release:
    types: [created]
  workflow_dispatch:

jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write # Required for NPM provenance authentication

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'

      - name: Install Dependencies
        run: npm ci

      - name: Run Full-Stack Test Suite
        run: npm test

      - name: Build Production Distributions
        run: npm run build

      - name: Publish to NPM with Provenance
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
`,
    },
    {
      path: 'README.md',
      content: `# OmniJS (@omni-js/core)

> The All-in-One Full-Stack JavaScript Framework.

OmniJS eliminates full-stack sprawl by co-locating database schemas, typed server RPC procedures, reactive client UI signals, scoped styles, and contract tests into a unified \`.omni\` single-file or modular multi-file architecture.

## Installation

\`\`\`bash
# Create a new project
npx omnijsfw create my-app

# Or install locally
npm install omnijsfw
\`\`\`

## Quickstart

Create \`app.omni\`:

\`\`\`omni
<schema>
  table Product {
    id: uuid @primary @auto
    title: string @min(2)
    price: float @positive
  }
</schema>

<server>
  query list() {
    return db.Product.findMany();
  }
</server>

<client>
  export default function App() {
    const { data: products } = $query(server.list);
    return <div>{products?.map(p => <h2 key={p.id}>{p.title}</h2>)}</div>;
  }
</client>
\`\`\`

Start the development server with Hot Module Replacement:

\`\`\`bash
npx omni dev --hmr
\`\`\`

## License
MIT
`,
    },
    {
      path: 'LICENSE',
      content: `MIT License

Copyright (c) 2026 OmniJS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,
    },
  ];
}
