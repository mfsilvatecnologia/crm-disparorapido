import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Determine port based on tenant
  const port = process.env.TENANT_PORT ? parseInt(process.env.TENANT_PORT) : 8080;
  const apiTarget = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

  return {
    server: {
      host: "::",
      port,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
      cors: {
        origin: [
          'http://localhost:8080',
          'http://localhost:8081', 
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'http://localhost:3003',
          'http://localhost:3004',
          'http://localhost:5173'
        ],
        credentials: true
      }
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      nodePolyfills({
        // Polyfill specific modules used by CopilotKit
        include: ['util', 'buffer'],
        // Enable Buffer global for is-buffer compatibility
        globals: {
          Buffer: true,
          global: false,
          process: false,
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: [
        { find: "@", replacement: path.resolve(__dirname, "./src") },
        { find: "chalk", replacement: path.resolve(__dirname, "./src/shared/utils/chalk-shim.ts") },
        { find: "is-buffer", replacement: path.resolve(__dirname, "./src/shared/utils/is-buffer-shim.ts") },
        { find: "extend", replacement: path.resolve(__dirname, "./src/shared/utils/extend-shim.ts") },
        { find: "debug", replacement: path.resolve(__dirname, "./src/shared/utils/debug-shim.ts") },
        { find: "style-to-object", replacement: path.resolve(__dirname, "./src/shared/utils/style-to-object-shim.ts") },
        {
          find: /^react-is$/,
          replacement: path.resolve(__dirname, "./src/shared/utils/react-is-shim.ts")
        },
      ],
    },
    optimizeDeps: {
      // REMOVED exclude for CopilotKit packages
      // Reason: These packages have dependency conflicts (react-markdown versions)
      // and need to be pre-bundled by Vite to resolve ESM issues
      include: [
        '@copilotkit/react-core',
        '@copilotkit/react-ui',
        '@copilotkit/runtime-client-gql',
        'react-markdown',
        'prop-types'
      ]
    },
    build: {
      sourcemap: false, // Disable sourcemaps to avoid warnings about missing source files
    },
  };
});
