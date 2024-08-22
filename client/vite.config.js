import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: path.resolve(__dirname, '../server/public'),
  },
  optimizeDeps: {
    include: ['crypto-js', 'axios', 'archiver', 'cors', 'nodemailer', 'pdf-lib', 'xlsx'],
  },
  resolve: {
    alias: {
      'archiver': path.resolve(__dirname, '../node_modules/archiver'),
      'axios': path.resolve(__dirname, '../node_modules/axios'),
      'crypto-js': path.resolve(__dirname, '../node_modules/crypto-js'),
      'cors': path.resolve(__dirname, '../node_modules/cors'),
      'nodemailer': path.resolve(__dirname, '../node_modules/nodemailer'),
      'pdf-lib': path.resolve(__dirname, '../node_modules/pdf-lib'),
      'xlsx': path.resolve(__dirname, '../node_modules/xlsx'),
    },
  },
});
