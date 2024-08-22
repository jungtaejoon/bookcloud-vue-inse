import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: path.resolve(__dirname, '../server/public'),
  },
  optimizeDeps: {
    include: ['crypto-js'],
  },
  resolve: {
    alias: {
      'crypto-js': path.resolve(__dirname, '../node_modules/crypto-js'),
    },
  },
});
