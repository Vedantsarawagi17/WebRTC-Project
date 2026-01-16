import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/ 
export default defineConfig({
  plugins: [tailwindcss(),react()],
  define: {
    global: 'window',
    'process.env': {},
  },
  resolve: {
    alias: {
      "events": path.resolve(__dirname, "./node_modules/events"),
      "util": path.resolve(__dirname, "./node_modules/util"),
    },
  },
  optimizeDeps: {
    exclude: ['fsevents','lightningcss']
  },
  // server : {port : 5173}
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Your Backend URL
        changeOrigin: true,
      },
    },
  },
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173, // Forces the frontend to stay on 3000 if you prefer
//     proxy: {
//       '/api': {
//         target: 'http://127.0.0.1:5000', // Use the IP address instead of 'localhost'
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// })
 