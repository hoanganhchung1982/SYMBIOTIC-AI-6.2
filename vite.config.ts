import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // 1. Đảm bảo Vite tìm index.html ở thư mục gốc
  root: './', 
  // 2. Đảm bảo mọi đường dẫn resource bắt đầu từ /
  base: '/', 
  resolve: {
    alias: {
      // Thiết lập @ để trỏ thẳng vào src, giúp sửa lỗi "Could not resolve"
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Đảm bảo dọn dẹp thư mục cũ trước khi build
    emptyOutDir: true, 
  },
  server: {
    port: 3000,
    host: true,
  },
});
