import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Remove any existing SEO tags from the template <head> to guarantee idempotency.
 */
function cleanTemplateHead(html) {
  return html
    .replace(/<!--\s*Primary SEO[\s\S]*?-->/gi, '')
    .replace(/<!--\s*Open Graph[\s\S]*?-->/gi, '')
    .replace(/<!--\s*Twitter[\s\S]*?-->/gi, '')
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\s+[^>]*property=["']og:[^"']*["'][^>]*>/gi, '')
    .replace(/<meta\s+[^>]*name=["']twitter:[^"']*["'][^>]*>/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
}

async function prerender() {
  console.log('🚀 Starting static prerendering...');

  const templatePath = path.resolve(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at ${templatePath}. Run 'vite build' first.`);
  }
  const rawTemplate = fs.readFileSync(templatePath, 'utf8');

  // Start Vite SSR in custom mode to load modules
  const vite = await createServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    const { ROUTES_SEO, SITE_NAME } = await vite.ssrLoadModule('/src/data/seoConfig.js');
    const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');

    const routes = Object.values(ROUTES_SEO);
    console.log(`📄 Prerendering ${routes.length} routes...`);

    for (const config of routes) {
      const routePath = config.path;
      console.log(`   Rendering ${routePath}...`);

      // 1. Render App HTML
      const { html: appHtml } = render(routePath);

      // 2. Clean base template
      let cleaned = cleanTemplateHead(rawTemplate);

      // 3. Build route-specific head SEO tags
      const seoTags = [
        `<!-- Primary SEO -->`,
        `<title>${config.title}</title>`,
        `<meta name="description" content="${escapeHtml(config.description)}" />`,
        `<link rel="canonical" href="${config.canonical}" />`,
        `<!-- Open Graph -->`,
        `<meta property="og:title" content="${escapeHtml(config.og?.title || config.title)}" />`,
        `<meta property="og:description" content="${escapeHtml(config.og?.description || config.description)}" />`,
        `<meta property="og:url" content="${config.og?.url || config.canonical}" />`,
        `<meta property="og:type" content="${config.og?.type || 'website'}" />`,
        `<meta property="og:site_name" content="${config.og?.siteName || SITE_NAME}" />`,
        `<!-- Twitter -->`,
        `<meta name="twitter:card" content="${config.twitter?.card || 'summary_large_image'}" />`,
        `<meta name="twitter:title" content="${escapeHtml(config.twitter?.title || config.title)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(config.twitter?.description || config.description)}" />`,
      ];

      if (config.jsonLd) {
        seoTags.push(`<script type="application/ld+json">${JSON.stringify(config.jsonLd)}</script>`);
      }

      const injectedHead = cleaned.replace('</head>', `    ${seoTags.join('\n    ')}\n  </head>`);

      // 4. Inject into root container
      const finalHtml = injectedHead.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

      // 5. Output file path
      let outPath;
      if (routePath === '/') {
        outPath = path.resolve(distDir, 'index.html');
      } else {
        const subDir = path.resolve(distDir, routePath.replace(/^\//, ''));
        if (!fs.existsSync(subDir)) {
          fs.mkdirSync(subDir, { recursive: true });
        }
        outPath = path.resolve(subDir, 'index.html');
      }

      fs.writeFileSync(outPath, finalHtml, 'utf8');
    }

    console.log('✅ Static prerendering completed successfully.');
  } finally {
    await vite.close();
  }
}

prerender().catch((err) => {
  console.error('❌ Prerendering failed:', err);
  process.exit(1);
});
