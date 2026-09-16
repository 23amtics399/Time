import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

async function runVerification() {
  console.log('🔍 Starting Complete Technical SEO & Content Quality Verification...\n');

  // Load route configuration
  const { ROUTES_SEO } = await import('../src/data/seoConfig.js');
  const routes = Object.values(ROUTES_SEO);

  let totalErrors = 0;
  const results = [];

  for (const route of routes) {
    const filePath = route.path === '/'
      ? path.resolve(distDir, 'index.html')
      : path.resolve(distDir, route.path.replace(/^\//, ''), 'index.html');

    if (!fs.existsSync(filePath)) {
      console.error(`❌ [${route.path}] File missing at ${filePath}`);
      totalErrors++;
      continue;
    }

    const html = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    // 1. Tag Counts
    const titleMatches = html.match(/<title>[\s\S]*?<\/title>/gi) || [];
    if (titleMatches.length !== 1) {
      errors.push(`title count is ${titleMatches.length} (expected 1)`);
    }

    const descMatches = html.match(/<meta\s+name=["']description["'][^>]*>/gi) || [];
    if (descMatches.length !== 1) {
      errors.push(`meta description count is ${descMatches.length} (expected 1)`);
    }

    const canonicalMatches = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi) || [];
    if (canonicalMatches.length !== 1) {
      errors.push(`canonical link count is ${canonicalMatches.length} (expected 1)`);
    }

    const ogTitleMatches = html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*>/gi) || [];
    if (ogTitleMatches.length !== 1) {
      errors.push(`og:title count is ${ogTitleMatches.length} (expected 1)`);
    }

    const ogDescMatches = html.match(/<meta\s+[^>]*property=["']og:description["'][^>]*>/gi) || [];
    if (ogDescMatches.length !== 1) {
      errors.push(`og:description count is ${ogDescMatches.length} (expected 1)`);
    }

    const ogUrlMatches = html.match(/<meta\s+[^>]*property=["']og:url["'][^>]*>/gi) || [];
    if (ogUrlMatches.length !== 1) {
      errors.push(`og:url count is ${ogUrlMatches.length} (expected 1)`);
    }

    const ogTypeMatches = html.match(/<meta\s+[^>]*property=["']og:type["'][^>]*>/gi) || [];
    if (ogTypeMatches.length !== 1) {
      errors.push(`og:type count is ${ogTypeMatches.length} (expected 1)`);
    }

    const ogSiteNameMatches = html.match(/<meta\s+[^>]*property=["']og:site_name["'][^>]*>/gi) || [];
    if (ogSiteNameMatches.length !== 1) {
      errors.push(`og:site_name count is ${ogSiteNameMatches.length} (expected 1)`);
    }

    const ogImageMatches = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*>/gi) || [];
    if (ogImageMatches.length !== 1) {
      errors.push(`og:image count is ${ogImageMatches.length} (expected 1)`);
    } else {
      const contentMatch = ogImageMatches[0].match(/content=["']([^"']*)["']/i);
      const extractedOgImage = contentMatch ? contentMatch[1] : '';
      if (extractedOgImage !== route.og.image) {
        errors.push(`og:image mismatch: "${extractedOgImage}" !== "${route.og.image}"`);
      }
    }

    const twCardMatches = html.match(/<meta\s+[^>]*name=["']twitter:card["'][^>]*>/gi) || [];
    if (twCardMatches.length !== 1) {
      errors.push(`twitter:card count is ${twCardMatches.length} (expected 1)`);
    }

    const twTitleMatches = html.match(/<meta\s+[^>]*name=["']twitter:title["'][^>]*>/gi) || [];
    if (twTitleMatches.length !== 1) {
      errors.push(`twitter:title count is ${twTitleMatches.length} (expected 1)`);
    }

    const twDescMatches = html.match(/<meta\s+[^>]*name=["']twitter:description["'][^>]*>/gi) || [];
    if (twDescMatches.length !== 1) {
      errors.push(`twitter:description count is ${twDescMatches.length} (expected 1)`);
    }

    const twImageMatches = html.match(/<meta\s+[^>]*name=["']twitter:image["'][^>]*>/gi) || [];
    if (twImageMatches.length !== 1) {
      errors.push(`twitter:image count is ${twImageMatches.length} (expected 1)`);
    } else {
      const contentMatch = twImageMatches[0].match(/content=["']([^"']*)["']/i);
      const extractedTwImage = contentMatch ? contentMatch[1] : '';
      if (extractedTwImage !== route.twitter.image) {
        errors.push(`twitter:image mismatch: "${extractedTwImage}" !== "${route.twitter.image}"`);
      }
    }

    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    if (h1Matches.length !== 1) {
      errors.push(`H1 count is ${h1Matches.length} (expected 1)`);
    }

    const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    if (jsonLdMatches.length !== 1) {
      errors.push(`JSON-LD count is ${jsonLdMatches.length} (expected 1)`);
    } else {
      // Validate JSON-LD syntax
      try {
        const jsonContent = jsonLdMatches[0].replace(/<script[^>]*>|<\/script>/gi, '');
        JSON.parse(jsonContent);
      } catch (err) {
        errors.push(`Invalid JSON-LD format: ${err.message}`);
      }
    }

function unescapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

    // 2. Value checks
    if (titleMatches.length === 1) {
      const extractedTitle = unescapeHtml(titleMatches[0].replace(/<\/?title>/gi, '').trim());
      if (extractedTitle !== route.title) {
        errors.push(`Title mismatch: "${extractedTitle}" !== "${route.title}"`);
      }
    }

    if (canonicalMatches.length === 1) {
      const hrefMatch = canonicalMatches[0].match(/href=["']([^"']*)["']/i);
      const extractedCanonical = hrefMatch ? hrefMatch[1] : '';
      if (extractedCanonical !== route.canonical) {
        errors.push(`Canonical mismatch: "${extractedCanonical}" !== "${route.canonical}"`);
      }
    }

    if (h1Matches.length === 1) {
      const extractedH1 = unescapeHtml(h1Matches[0].replace(/<[^>]*>/g, '').trim());
      if (extractedH1 !== route.h1) {
        errors.push(`H1 mismatch: "${extractedH1}" !== "${route.h1}"`);
      }
    }

    // 3. Content Quality checks
    const rootStart = html.indexOf('<div id="root">');
    const bodyEnd = html.indexOf('</body>');
    const rootHtml = (rootStart !== -1 && bodyEnd !== -1)
      ? html.substring(rootStart + '<div id="root">'.length, bodyEnd).replace(/<script[\s\S]*?<\/script>/gi, '')
      : '';
    if (!rootHtml || rootHtml.trim() === '') {
      errors.push('Prerender root content is empty');
    }

    // Count words in body content (strip HTML tags)
    const textOnly = rootHtml
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
    if (wordCount < 150) {
      errors.push(`Thin content detected: only ${wordCount} words rendered in HTML`);
    }

    // Check headings hierarchy
    const h2Matches = html.match(/<h2[^>]*>/gi) || [];
    if (h2Matches.length === 0) {
      errors.push('No H2 section headings found');
    }

    // Check internal links
    const internalLinkMatches = html.match(/<a\s+[^>]*href=["'](\/[^"']*)["']/gi) || [];
    if (internalLinkMatches.length === 0) {
      errors.push('No crawlable internal links found');
    }

    if (errors.length > 0) {
      totalErrors += errors.length;
      results.push({ route: route.path, status: 'FAIL', errors, wordCount });
    } else {
      results.push({ route: route.path, status: 'PASS', errors: [], wordCount });
    }
  }

  // Check sitemap.xml
  const sitemapPath = path.resolve(distDir, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    for (const route of routes) {
      if (!sitemapContent.includes(`<loc>${route.canonical}</loc>`)) {
        console.error(`❌ sitemap.xml missing canonical URL: ${route.canonical}`);
        totalErrors++;
      }
    }
  } else {
    console.warn(`⚠️ sitemap.xml not found in dist/`);
  }

  // Check robots.txt
  const robotsPath = path.resolve(distDir, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    if (!robotsContent.includes('Sitemap: https://time.sji.one/sitemap.xml')) {
      console.error('❌ robots.txt does not link to https://time.sji.one/sitemap.xml');
      totalErrors++;
    }
  } else {
    console.warn(`⚠️ robots.txt not found in dist/`);
  }

  // Check Static Assets in dist/
  const requiredAssets = [
    'favicon.svg',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'icon-192.png',
    'icon-512.png',
    'manifest.webmanifest',
    'og-image.png',
    'twitter-card.png',
    'icons/clock.svg',
    'icons/analog-clock.svg',
    'icons/world-clock.svg',
    'icons/stopwatch.svg',
    'icons/countdown.svg',
    'icons/pomodoro.svg',
    'icons/alarm.svg',
    'icons/unix.svg',
    'icons/timezone.svg',
    'icons/time-diff.svg',
    'icons/add-subtract.svg',
    'icons/time-converter.svg',
    'icons/military-time.svg',
    'icons/working-hours.svg',
    'icons/time-formats.svg',
    'icons/date-countdown.svg',
    'icons/meeting.svg',
    'icons/dst-checker.svg',
    'icons/sleep-time.svg',
    'icons/week-number.svg',
  ];

  for (const relPath of requiredAssets) {
    const fullPath = path.resolve(distDir, relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Static asset missing in dist/: ${relPath}`);
      totalErrors++;
    }
  }


  // Print Summary Table
  console.log('ROUTE'.padEnd(20) + 'STATUS'.padEnd(10) + 'WORDS'.padEnd(10) + 'DETAILS');
  console.log('-'.repeat(65));
  for (const res of results) {
    const detail = res.errors.length > 0 ? res.errors.join(', ') : 'All SEO & Content checks passed';
    console.log(`${res.route.padEnd(20)}${res.status.padEnd(10)}${String(res.wordCount).padEnd(10)}${detail}`);
  }

  console.log('='.repeat(65));
  if (totalErrors === 0) {
    console.log(`🎉 ALL ${routes.length} ROUTES PASSED TECHNICAL SEO & CONTENT QUALITY AUDIT!`);
  } else {
    console.error(`❌ VERIFICATION FAILED WITH ${totalErrors} ERROR(S)`);
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
