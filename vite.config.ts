import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Zoho only keeps web-form leads that come from the real website address, so while developing on localhost
// the form posts to /zoho-lead and this proxy passes it on as if it came from the live site. Not used in the build.
/** Makes the built stylesheet non-blocking: the page's first paint no longer waits for the CSS file; the app waits for it before it draws (see main.tsx). */
const nonBlockingCss = (): Plugin => ({
  name: 'non-blocking-css',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (html) => html.replace(/<link rel="stylesheet"([^>]*?)href="([^"]+\.css)"([^>]*)>/g, (_m, a, href, b) =>
      `<link rel="stylesheet"${a}href="${href}"${b} media="print" onload="this.media='all';window.__css=1;dispatchEvent(new Event('isf-css'))"><noscript><link rel="stylesheet" href="${href}"></noscript>`),
  },
})

export default defineConfig({
  plugins: [react(), nonBlockingCss()],
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
