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
    .replace(/<meta\s+name=["']robots["'][^>]*>/gi, '')
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
        `<meta name="robots" content="index, follow" />`,
        `<link rel="canonical" href="${config.canonical}" />`,
        `<!-- Open Graph -->`,
        `<meta property="og:title" content="${escapeHtml(config.og?.title || config.title)}" />`,
        `<meta property="og:description" content="${escapeHtml(config.og?.description || config.description)}" />`,
        `<meta property="og:url" content="${config.og?.url || config.canonical}" />`,
        `<meta property="og:type" content="${config.og?.type || 'website'}" />`,
        `<meta property="og:site_name" content="${config.og?.siteName || SITE_NAME}" />`,
        `<meta property="og:image" content="${config.og?.image || 'https://time.sji.one/og-image.png'}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${escapeHtml(config.title)}" />`,
        `<!-- Twitter -->`,
        `<meta name="twitter:card" content="${config.twitter?.card || 'summary_large_image'}" />`,
        `<meta name="twitter:title" content="${escapeHtml(config.twitter?.title || config.title)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(config.twitter?.description || config.description)}" />`,
        `<meta name="twitter:image" content="${config.twitter?.image || config.og?.image || 'https://time.sji.one/og-image.png'}" />`,
      ];

      if (config.jsonLd) {
        seoTags.push(`<script type="application/ld+json">${JSON.stringify(config.jsonLd)}</script>`);
      }

      const injectedHead = cleaned.replace('</head>', `    ${seoTags.join('\n    ')}\n  </head>`);

      // 4. Inject into root container
      const finalHtml = injectedHead.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

      // 5. Output file path (extensionless route files for Cloudflare Pages clean URLs)
      let outPath;
      if (routePath === '/') {
        outPath = path.resolve(distDir, 'index.html');
      } else {
        const routeName = routePath.replace(/^\//, '');
        // Clean up legacy directory if present to avoid Cloudflare directory-index 308 redirection
        const oldSubDir = path.resolve(distDir, routeName);
        if (fs.existsSync(oldSubDir) && fs.statSync(oldSubDir).isDirectory()) {
          fs.rmSync(oldSubDir, { recursive: true, force: true });
        }
        outPath = path.resolve(distDir, `${routeName}.html`);
      }

      fs.writeFileSync(outPath, finalHtml, 'utf8');
    }

    // 6. Prerender 404.html for Cloudflare Pages native 404 status handling
    console.log('   Rendering 404.html...');
    const { html: notFoundHtml } = render('/404-not-found');
    let cleaned404 = cleanTemplateHead(rawTemplate);
    const seoTags404 = [
      `<!-- 404 Error SEO -->`,
      `<title>Page Not Found | Time Tools</title>`,
      `<meta name="description" content="The requested page could not be found. Explore our 20 free online time utilities." />`,
      `<meta name="robots" content="noindex, nofollow" />`,
    ];
    const injectedHead404 = cleaned404.replace('</head>', `    ${seoTags404.join('\n    ')}\n  </head>`);
    const final404Html = injectedHead404.replace('<div id="root"></div>', `<div id="root">${notFoundHtml}</div>`);
    fs.writeFileSync(path.resolve(distDir, '404.html'), final404Html, 'utf8');

    console.log('✅ Static prerendering completed successfully.');
  } finally {
    await vite.close();
  }
}

prerender().catch((err) => {
  console.error('❌ Prerendering failed:', err);
  process.exit(1);
});
