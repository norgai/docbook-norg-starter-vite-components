import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 0,            // 👈 let Vite auto-select
    strictPort: false,  // default; keeps trying 5174, 5175…
    allowedHosts: true,  // accept requests for any hostname
    hmr: { overlay: true } 
  }
})
