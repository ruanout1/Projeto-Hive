import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      // O único alias que você precisa é este, para mapear '@' para 'src'
      '@': path.resolve(__dirname, './src'),

      // Os outros aliases que você tinha (ex: 'vaul@1.1.2': 'vaul')
      // estavam incorretos. O gerenciamento de versão é feito no package.json,
      // não aqui no 'alias' do Vite.
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    // Seu servidor está configurado para a porta 3000
    port: 5173,
    open: true,
  },
});
