import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'jeolyaksoop',
  brand: {
    displayName: '절약숲',
    primaryColor: '#0F6C47',
    // 반려 방지: 반드시 https 절대 URL (상대 경로는 TDS 아이콘 이름으로 처리됨)
    icon: 'https://raw.githubusercontent.com/sssoolleee-art/assets/main/jeolyaksoop-icon.png',
  },
  web: {
    host: 'localhost',
    port: 5191,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
