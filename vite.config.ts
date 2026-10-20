import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Zoho only keeps web-form leads that come from the real website address, so while developing on localhost
// the form posts to /zoho-lead and this proxy passes it on as if it came from the live site. Not used in the build.
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // vendor code in its own files: they download in parallel and stay cached between deploys
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion'
          if (id.includes('lucide-react')) return 'icons'
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
  server: {
    proxy: {
      '/zoho-lead': {
        target: 'https://crm.zoho.in',
        changeOrigin: true,
        rewrite: () => '/crm/WebToLeadForm',
        headers: { Origin: 'https://indiasportsfloorings.com', Referer: 'https://indiasportsfloorings.com/contact/' },
      },
    },
  },
})
