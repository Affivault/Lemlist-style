import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@lemlist/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom', 'react-router-dom'],
          charts:   ['recharts'],
          icons:    ['lucide-react'],
          toast:    ['react-hot-toast'],
          query:    ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          editor:   [
            '@tiptap/react', '@tiptap/starter-kit',
            '@tiptap/extension-link', '@tiptap/extension-placeholder',
            '@tiptap/extension-underline',
          ],
          dnd:      ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          utils:    ['axios', 'date-fns', 'papaparse', 'clsx'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/t': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
