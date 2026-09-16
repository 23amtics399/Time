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
  '.svg': 'image/svg+xml'
};

function serveDist() {
  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') {
      urlPath = '/index.html';
    }

    let filePath = path.join(distDir, urlPath);

    // If it's a directory or clean URL without extension
    if (!path.extname(filePath)) {
      if (fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      } else if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // Fallback to root index.html (SPA)
      const fallback = path.join(distDir, 'index.html');
      if (fs.existsSync(fallback)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(fallback).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
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

  for (const route of routes) {
    const url = `http://127.0.0.1:4173${route.path}`;
    const response = await fetch(url);
    if (response.status !== 200) {
      console.error(`❌ [${route.path}] HTTP status ${response.status}`);
      failures++;
      continue;
    }

    const html = await response.text();

    const titleMatches = html.match(/<title>[\s\S]*?<\/title>/gi) || [];
    const descMatches = html.match(/<meta\s+name=["']description["'][^>]*>/gi) || [];
    const canonicalMatches = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi) || [];
    const ogTitleMatches = html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*>/gi) || [];
    const ogDescMatches = html.match(/<meta\s+[^>]*property=["']og:description["'][^>]*>/gi) || [];
    const ogUrlMatches = html.match(/<meta\s+[^>]*property=["']og:url["'][^>]*>/gi) || [];
    const ogTypeMatches = html.match(/<meta\s+[^>]*property=["']og:type["'][^>]*>/gi) || [];
    const ogSiteMatches = html.match(/<meta\s+[^>]*property=["']og:site_name["'][^>]*>/gi) || [];
    const twCardMatches = html.match(/<meta\s+[^>]*name=["']twitter:card["'][^>]*>/gi) || [];
    const twTitleMatches = html.match(/<meta\s+[^>]*name=["']twitter:title["'][^>]*>/gi) || [];
    const twDescMatches = html.match(/<meta\s+[^>]*name=["']twitter:description["'][^>]*>/gi) || [];
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

    const errors = [];
    if (titleMatches.length !== 1) errors.push(`title: ${titleMatches.length}`);
    if (descMatches.length !== 1) errors.push(`description: ${descMatches.length}`);
    if (canonicalMatches.length !== 1) errors.push(`canonical: ${canonicalMatches.length}`);
    if (ogTitleMatches.length !== 1) errors.push(`og:title: ${ogTitleMatches.length}`);
    if (ogDescMatches.length !== 1) errors.push(`og:description: ${ogDescMatches.length}`);
    if (ogUrlMatches.length !== 1) errors.push(`og:url: ${ogUrlMatches.length}`);
    if (ogTypeMatches.length !== 1) errors.push(`og:type: ${ogTypeMatches.length}`);
    if (ogSiteMatches.length !== 1) errors.push(`og:site_name: ${ogSiteMatches.length}`);
    if (twCardMatches.length !== 1) errors.push(`twitter:card: ${twCardMatches.length}`);
    if (twTitleMatches.length !== 1) errors.push(`twitter:title: ${twTitleMatches.length}`);
    if (twDescMatches.length !== 1) errors.push(`twitter:description: ${twDescMatches.length}`);
    if (h1Matches.length !== 1) errors.push(`H1: ${h1Matches.length}`);
    if (jsonLdMatches.length !== 1) errors.push(`JSON-LD: ${jsonLdMatches.length}`);

function unescapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

    // Verify H1 value
    const h1Text = h1Matches[0] ? unescapeHtml(h1Matches[0].replace(/<[^>]*>/g, '').trim()) : '';
    if (h1Text !== route.h1) {
      errors.push(`H1 text: "${h1Text}" !== "${route.h1}"`);
    }

    // Verify Title value
    const titleText = titleMatches[0] ? unescapeHtml(titleMatches[0].replace(/<\/?title>/gi, '').trim()) : '';
    if (titleText !== route.title) {
      errors.push(`Title text mismatch: "${titleText}" !== "${route.title}"`);
    }

    // Verify Canonical value
    const canonicalHref = canonicalMatches[0] ? (canonicalMatches[0].match(/href=["']([^"']*)["']/i) || [])[1] : '';
    if (canonicalHref !== route.canonical) {
      errors.push(`Canonical href mismatch: "${canonicalHref}" !== "${route.canonical}"`);
    }

    // Check non-empty root content
    const rootStart = html.indexOf('<div id="root">');
    const bodyEnd = html.indexOf('</body>');
    const rootHtml = (rootStart !== -1 && bodyEnd !== -1)
      ? html.substring(rootStart + '<div id="root">'.length, bodyEnd).replace(/<script[\s\S]*?<\/script>/gi, '')
      : '';
    if (!rootHtml || rootHtml.trim() === '') {
      errors.push('Empty #root content in raw HTTP response');
    }

    if (errors.length > 0) {
      console.error(`❌ [${route.path}] ${errors.join(', ')}`);
      failures++;
    } else {
      console.log(`✅ [${route.path}] 200 OK | H1: "${h1Text}" | Canonical: ${canonicalHref} | All 13 tags === 1`);
    }
  }

  server.close();
  console.log('\n' + '='.repeat(65));
  if (failures === 0) {
    console.log(`🎉 LOCAL RAW HTTP CHECKS PASSED FOR ALL ${routes.length} ROUTES!\n`);
  } else {
    console.error(`💥 ${failures} route(s) failed raw HTTP check.`);
    process.exit(1);
  }
}

runLocalHttpCheck().catch(err => {
  console.error(err);
  process.exit(1);
});
