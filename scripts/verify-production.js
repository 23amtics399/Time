import { ROUTES_SEO } from '../src/data/seoConfig.js';

async function verifyProduction() {
  console.log('🌐 Testing Live Production Website (https://time.sji.one/)...\n');
  const routes = Object.values(ROUTES_SEO);
  let totalErrors = 0;

  // 1. Clean Canonical URLs (must return 200 OK directly without redirect)
  console.log('--- 1. Testing Clean Canonical URLs (must return 200 OK directly) ---');
  for (const route of routes) {
    const url = `https://time.sji.one${route.path}`;
    try {
      const response = await fetch(url, {
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
      });

      if (response.status !== 200) {
        console.error(`❌ [${route.path}] HTTP Status: ${response.status} (expected 200), Location: ${response.headers.get('location')}`);
        totalErrors++;
        continue;
      }

      const hsts = response.headers.get('strict-transport-security');
      if (!hsts) {
        console.error(`❌ [${route.path}] Missing Strict-Transport-Security header`);
        totalErrors++;
      }

      const html = await response.text();

      const titleMatches = html.match(/<title>[\s\S]*?<\/title>/gi) || [];
      const descMatches = html.match(/<meta\s+name=["']description["'][^>]*>/gi) || [];
      const canonicalMatches = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi) || [];
      const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
      const footerMatches = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/gi) || [];
      const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

      const errors = [];
      if (titleMatches.length !== 1) errors.push(`title count: ${titleMatches.length}`);
      if (descMatches.length !== 1) errors.push(`desc count: ${descMatches.length}`);
      if (canonicalMatches.length !== 1) errors.push(`canonical count: ${canonicalMatches.length}`);
      if (h1Matches.length !== 1) errors.push(`H1 count: ${h1Matches.length}`);
      if (footerMatches.length !== 1) errors.push(`footer count: ${footerMatches.length}`);
      if (jsonLdMatches.length !== 1) errors.push(`JSON-LD count: ${jsonLdMatches.length}`);

      function unescapeHtml(str) {
        if (!str) return '';
        return str
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
      }

      const titleText = titleMatches[0] ? unescapeHtml(titleMatches[0].replace(/<\/?title>/gi, '').trim()) : '';
      if (titleText !== route.title) {
        errors.push(`Title mismatch: "${titleText}" !== "${route.title}"`);
      }

      const canonicalHref = canonicalMatches[0] ? (canonicalMatches[0].match(/href=["']([^"']*)["']/i) || [])[1] : '';
      if (canonicalHref !== route.canonical) {
        errors.push(`Canonical mismatch: "${canonicalHref}" !== "${route.canonical}"`);
      }

      const h1Text = h1Matches[0] ? unescapeHtml(h1Matches[0].replace(/<[^>]*>/g, '').trim()) : '';
      if (h1Text !== route.h1) {
        errors.push(`H1 mismatch: "${h1Text}" !== "${route.h1}"`);
      }

      const rootStart = html.indexOf('<div id="root">');
      const bodyEnd = html.indexOf('</body>');
      const rootHtml = (rootStart !== -1 && bodyEnd !== -1)
        ? html.substring(rootStart + '<div id="root">'.length, bodyEnd).replace(/<script[\s\S]*?<\/script>/gi, '')
        : '';
      const textOnly = rootHtml
        .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
      if (wordCount < 100) {
        errors.push(`Thin/missing content: only ${wordCount} words in #root`);
      }

      if (errors.length > 0) {
        console.error(`❌ [${route.path}] FAILED: ${errors.join(', ')}`);
        totalErrors += errors.length;
      } else {
        console.log(`✅ [${route.path}] 200 OK | H1: "${h1Text}" | Canonical: ${canonicalHref} | Words: ${wordCount}`);
      }
    } catch (err) {
      console.error(`💥 [${route.path}] Request error:`, err.message);
      totalErrors++;
    }
  }

  // 2. Trailing Slash 308 Redirect Policy
  console.log('\n--- 2. Testing Trailing Slash Redirects (must return 308 -> clean canonical) ---');
  for (const route of routes) {
    if (route.path === '/') continue;
    const slashUrl = `https://time.sji.one${route.path}/`;
    try {
      const res = await fetch(slashUrl, { redirect: 'manual' });
      const location = res.headers.get('location');
      const cleanExpected = route.path;
      if (res.status === 308 && (location === cleanExpected || location === `https://time.sji.one${cleanExpected}`)) {
        console.log(`   ✅ [308 Permanent Redirect] ${route.path}/ -> ${location}`);
      } else {
        console.error(`   ❌ [${res.status}] ${route.path}/ returned location: ${location} (expected 308 -> ${cleanExpected})`);
        totalErrors++;
      }
    } catch (err) {
      console.error(`💥 ${slashUrl}:`, err.message);
      totalErrors++;
    }
  }

  // 3. Soft-404 Validation (Unknown paths must return HTTP 404)
  console.log('\n--- 3. Testing Soft-404 Prevention (must return HTTP 404 Not Found) ---');
  const invalidPaths = ['/nope-xyz', '/not-a-real-page', '/fake-tool-route'];
  for (const inv of invalidPaths) {
    try {
      const res = await fetch(`https://time.sji.one${inv}`, { redirect: 'manual' });
      const body = await res.text();
      if (res.status === 404) {
        const isNotFoundPage = body.includes('Page Not Found') || body.includes('404');
        const isNotHomepage = !body.includes('<h1>Time Tools</h1>');
        if (isNotFoundPage && isNotHomepage) {
          console.log(`   ✅ [404 Not Found] ${inv} returned HTTP 404 with custom Not Found page`);
        } else {
          console.error(`   ❌ ${inv} returned 404 but body appears to be homepage content`);
          totalErrors++;
        }
      } else {
        console.error(`   ❌ [${res.status}] ${inv} returned HTTP ${res.status} (expected 404)`);
        totalErrors++;
      }
    } catch (err) {
      console.error(`💥 ${inv}:`, err.message);
      totalErrors++;
    }
  }

  // 4. Real Static Assets Verification
  console.log('\n--- 4. Checking Live Static Assets on https://time.sji.one ---');
  const liveAssets = [
    { path: '/favicon.ico', expectedType: 'image/' },
    { path: '/favicon.svg', expectedType: 'image/svg+xml' },
    { path: '/favicon-16x16.png', expectedType: 'image/png' },
    { path: '/favicon-32x32.png', expectedType: 'image/png' },
    { path: '/apple-touch-icon.png', expectedType: 'image/png' },
    { path: '/icon-192.png', expectedType: 'image/png' },
    { path: '/icon-512.png', expectedType: 'image/png' },
    { path: '/site.webmanifest', expectedType: 'manifest+json', isJson: true },
    { path: '/manifest.webmanifest', expectedType: 'manifest+json', isJson: true },
    { path: '/og-image.png', expectedType: 'image/png' },
    { path: '/og-image.jpg', expectedType: 'image/jpeg' },
    { path: '/twitter-card.png', expectedType: 'image/png' },
    { path: '/sitemap.xml', expectedType: 'xml' },
    { path: '/robots.txt', expectedType: 'text/plain' },
  ];

  for (const asset of liveAssets) {
    try {
      const assetUrl = `https://time.sji.one${asset.path}`;
      const res = await fetch(assetUrl);
      const ct = res.headers.get('content-type') || '';
      if (res.status === 200 && ct.includes(asset.expectedType)) {
        if (asset.isJson) {
          const json = await res.json();
          if (json.name === 'Time Tools' && Array.isArray(json.icons)) {
            console.log(`   ✅ [200 OK] ${asset.path} (${ct}) — Valid Manifest JSON with ${json.icons.length} icons`);
          } else {
            console.error(`   ❌ ${asset.path} invalid manifest content`);
            totalErrors++;
          }
        } else {
          console.log(`   ✅ [200 OK] ${asset.path} (${ct})`);
        }
      } else {
        console.error(`   ❌ [${res.status}] ${asset.path} (${ct}, expected: ${asset.expectedType})`);
        totalErrors++;
      }
    } catch (err) {
      console.error(`   💥 ${asset.path}: ${err.message}`);
      totalErrors++;
    }
  }

  console.log('\n' + '='.repeat(65));
  if (totalErrors === 0) {
    console.log(`🎉 LIVE PRODUCTION VERIFICATION PASSED FOR ALL ${routes.length} ROUTES & CHECKS!`);
  } else {
    console.warn(`⚠️ PRODUCTION VERIFICATION completed with ${totalErrors} issue(s).`);
    process.exit(1);
  }
}

verifyProduction();
