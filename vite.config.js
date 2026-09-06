const { defineConfig } = require('vite');
const { resolve } = require('path');

module.exports = defineConfig({
  root: 'frontend',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html'),
        dashboard: resolve(__dirname, 'frontend/dashboard.html'),
        buyerDashboard: resolve(__dirname, 'frontend/pages/buyer/dashboard.html'),
        logisticsDashboard: resolve(__dirname, 'frontend/pages/logistics/dashboard.html')
      }
    }
  },
  server: {
    proxy: { '/api': 'http://127.0.0.1:8000' }
  }
});
