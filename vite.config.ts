import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Zoho only keeps web-form leads that come from the real website address, so while developing on localhost
// the form posts to /zoho-lead and this proxy passes it on as if it came from the live site. Not used in the build.
export default defineConfig({
  plugins: [react()],
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
