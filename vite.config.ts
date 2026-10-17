import { defineConfig, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

const proxy = (target: string, prefix: string): ProxyOptions => ({
  target,
  changeOrigin: true,
  secure: true,
  rewrite: (path) => path.replace(prefix, ''),
});

const aiProxy: Record<string, ProxyOptions> = {
  '/__nila/ai/ollama': proxy('https://ollama.com', '/__nila/ai/ollama'),
  '/__nila/ai/gemini': proxy('https://generativelanguage.googleapis.com', '/__nila/ai/gemini'),
  '/__nila/ai/openai': proxy('https://api.openai.com', '/__nila/ai/openai'),
};

export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173, proxy: aiProxy },
  preview: { host: '127.0.0.1', port: 4173, proxy: aiProxy },
  build: { sourcemap: true },
});
