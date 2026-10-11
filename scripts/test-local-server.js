import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

function parseRedirects() {
  const redirectsFile = path.join(distDir, '_redirects');
  const rules = [];
  if (fs.existsSync(redirectsFile)) {
    const lines = fs.readFileSync(redirectsFile, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        rules.push({
          from: parts[0],
          to: parts[1],
          status: parseInt(parts[2] || '302', 10),
        });
      }
    }
  }
  return rules;
}

function serveDist() {
  const redirectRules = parseRedirects();

  const server = http.createServer((req, res) => {
    const rawUrl = req.url;
    let [urlPath, queryString] = rawUrl.split('?');

    // 1. Check _redirects rules first
    for (const rule of redirectRules) {
      if (rule.from === urlPath) {
        const dest = queryString ? `${rule.to}?${queryString}` : rule.to;
        res.writeHead(rule.status, {
          'Location': dest,
          'Strict-Transport-Security': 'max-age=31536000',
        });
        res.end();
        return;
      }
    }

    if (urlPath === '/') {
      urlPath = '/index.html';
    }

    let filePath = path.join(distDir, urlPath);

    // If it's a clean URL without extension
    if (!path.extname(filePath)) {
      if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': mime,
        'Strict-Transport-Security': 'max-age=31536000',
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // 404 handler matching Cloudflare Pages
      const notFoundPath = path.join(distDir, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, {
          'Content-Type': 'text/html; charset=utf-8',
          'Strict-Transport-Security': 'max-age=31536000',
        });
        fs.createReadStream(notFoundPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    }
  });

  return new Promise((resolve) => {
    server.listen(4173, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

async function runLocalHttpCheck() {
  const server = await serveDist();
  console.log('📡 Local preview HTTP server running on http://127.0.0.1:4173\n');

  const { ROUTES_SEO } = await import('../src/data/seoConfig.js');
  const routes = Object.values(ROUTES_SEO);

  let failures = 0;

  // 1. Verify clean routes return 200 OK directly
  for (const route of routes) {
    const url = `http://127.0.0.1:4173${route.path}`;
    const response = await fetch(url, { redirect: 'manual' });
    if (response.status !== 200) {
      console.error(`❌ [${route.path}] HTTP status ${response.status}`);
      failures++;
      continue;
    }

    const html = await response.text();

    const titleMatches = html.match(/<title>[\s\S]*?<\/title>/gi) || [];
    const descMatches = html.match(/<meta\s+name=["']description["'][^>]*>/gi) || [];
    const canonicalMatches = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi) || [];
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    const footerMatches = html.match(/<footer[^>]*>[\s\S]*?<\/footer>/gi) || [];

    const errors = [];
    if (titleMatches.length !== 1) errors.push(`title: ${titleMatches.length}`);
    if (descMatches.length !== 1) errors.push(`description: ${descMatches.length}`);
    if (canonicalMatches.length !== 1) errors.push(`canonical: ${canonicalMatches.length}`);
    if (h1Matches.length !== 1) errors.push(`H1: ${h1Matches.length}`);
    if (footerMatches.length !== 1) errors.push(`footer: ${footerMatches.length}`);

    function unescapeHtml(str) {
      if (!str) return '';
      return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }

    const h1Text = h1Matches[0] ? unescapeHtml(h1Matches[0].replace(/<[^>]*>/g, '').trim()) : '';
    if (h1Text !== route.h1) {
      errors.push(`H1 text: "${h1Text}" !== "${route.h1}"`);
    }

    const canonicalHref = canonicalMatches[0] ? (canonicalMatches[0].match(/href=["']([^"']*)["']/i) || [])[1] : '';
    if (canonicalHref !== route.canonical) {
      errors.push(`Canonical href mismatch: "${canonicalHref}" !== "${route.canonical}"`);
    }

    if (errors.length > 0) {
      console.error(`❌ [${route.path}] ${errors.join(', ')}`);
      failures++;
    } else {
      console.log(`✅ [${route.path}] 200 OK | H1: "${h1Text}" | Canonical: ${canonicalHref} | Footer: OK`);
    }
  }

  // 2. Verify Trailing Slash 308 Redirects
  console.log('\n🔄 Testing Trailing Slash 308 Redirects to Clean URLs...');
  const slashRoutes = ['/clock/', '/analog/', '/world-clock/', '/stopwatch/', '/countdown/', '/about/'];
  for (const sRoute of slashRoutes) {
    const res = await fetch(`http://127.0.0.1:4173${sRoute}`, { redirect: 'manual' });
    const cleanExpected = sRoute.replace(/\/$/, '');
    if (res.status === 308 && res.headers.get('location') === cleanExpected) {
      console.log(`   ✅ [308 Redirect] ${sRoute} -> ${res.headers.get('location')}`);
    } else {
      console.error(`   ❌ ${sRoute} returned status ${res.status}, location: ${res.headers.get('location')}`);
      failures++;
    }
  }

  // 3. Verify Soft-404 is Fixed (404 status and custom page)
  console.log('\n🚫 Testing 404 Status Handling on Invalid URLs...');
  const invalidUrls = ['/nope-xyz', '/not-a-real-tool', '/random-invalid-page'];
  for (const inv of invalidUrls) {
    const res = await fetch(`http://127.0.0.1:4173${inv}`, { redirect: 'manual' });
    const text = await res.text();
    if (res.status === 404 && text.includes('Page Not Found') && text.includes('noindex')) {
      console.log(`   ✅ [404 Not Found] ${inv} returned HTTP 404 with custom 404 page & noindex`);
    } else {
      console.error(`   ❌ ${inv} returned status ${res.status} (expected 404)`);
      failures++;
    }
  }

  // 4. Verify Static Assets
  console.log('\n📦 Verifying Static Asset HTTP responses...');
  const staticAssets = [
    { path: '/favicon.ico', expectedType: 'image/x-icon' },
    { path: '/favicon.svg', expectedType: 'image/svg+xml' },
    { path: '/favicon-16x16.png', expectedType: 'image/png' },
    { path: '/favicon-32x32.png', expectedType: 'image/png' },
    { path: '/apple-touch-icon.png', expectedType: 'image/png' },
    { path: '/icon-192.png', expectedType: 'image/png' },
    { path: '/icon-512.png', expectedType: 'image/png' },
    { path: '/site.webmanifest', expectedType: 'application/manifest+json' },
    { path: '/manifest.webmanifest', expectedType: 'application/manifest+json' },
    { path: '/og-image.png', expectedType: 'image/png' },
    { path: '/og-image.jpg', expectedType: 'image/jpeg' },
    { path: '/twitter-card.png', expectedType: 'image/png' },
  ];

  for (const asset of staticAssets) {
    const assetUrl = `http://127.0.0.1:4173${asset.path}`;
    const res = await fetch(assetUrl);
    const contentType = res.headers.get('content-type');
    if (res.status === 200 && contentType.includes(asset.expectedType)) {
      console.log(`   ✅ [200 OK] ${asset.path} (${contentType})`);
    } else {
      console.error(`   ❌ [${res.status}] ${asset.path} (type: ${contentType}, expected: ${asset.expectedType})`);
      failures++;
    }
  }

  server.close();
  console.log('\n' + '='.repeat(65));
  if (failures === 0) {
    console.log(`🎉 LOCAL RAW HTTP CHECKS PASSED FOR ALL ${routes.length} ROUTES & ASSETS!\n`);
  } else {
    console.error(`💥 ${failures} check(s) failed raw HTTP check.`);
    process.exit(1);
  }
}

runLocalHttpCheck().catch(err => {
  console.error(err);
  process.exit(1);
});
