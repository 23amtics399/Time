import { ROUTES_SEO } from '../src/data/seoConfig.js';

async function verifyProduction() {
  console.log('🌐 Testing Live Production Website (https://time.sji.one/)...\n');
  const routes = Object.values(ROUTES_SEO);
  let totalErrors = 0;

  for (const route of routes) {
    const url = `https://time.sji.one${route.path}`;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        }
      });

      if (response.status !== 200) {
        console.error(`❌ [${route.path}] HTTP Status: ${response.status}`);
        totalErrors++;
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
      const ogImageMatches = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*>/gi) || [];
      const twCardMatches = html.match(/<meta\s+[^>]*name=["']twitter:card["'][^>]*>/gi) || [];
      const twTitleMatches = html.match(/<meta\s+[^>]*name=["']twitter:title["'][^>]*>/gi) || [];
      const twDescMatches = html.match(/<meta\s+[^>]*name=["']twitter:description["'][^>]*>/gi) || [];
      const twImageMatches = html.match(/<meta\s+[^>]*name=["']twitter:image["'][^>]*>/gi) || [];
      const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
      const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

      const errors = [];
      if (titleMatches.length !== 1) errors.push(`title count: ${titleMatches.length}`);
      if (descMatches.length !== 1) errors.push(`desc count: ${descMatches.length}`);
      if (canonicalMatches.length !== 1) errors.push(`canonical count: ${canonicalMatches.length}`);
      if (ogTitleMatches.length !== 1) errors.push(`og:title count: ${ogTitleMatches.length}`);
      if (ogDescMatches.length !== 1) errors.push(`og:description count: ${ogDescMatches.length}`);
      if (ogUrlMatches.length !== 1) errors.push(`og:url count: ${ogUrlMatches.length}`);
      if (ogTypeMatches.length !== 1) errors.push(`og:type count: ${ogTypeMatches.length}`);
      if (ogSiteMatches.length !== 1) errors.push(`og:site_name count: ${ogSiteMatches.length}`);
      if (ogImageMatches.length !== 1) errors.push(`og:image count: ${ogImageMatches.length}`);
      if (twCardMatches.length !== 1) errors.push(`twitter:card count: ${twCardMatches.length}`);
      if (twTitleMatches.length !== 1) errors.push(`twitter:title count: ${twTitleMatches.length}`);
      if (twDescMatches.length !== 1) errors.push(`twitter:description count: ${twDescMatches.length}`);
      if (twImageMatches.length !== 1) errors.push(`twitter:image count: ${twImageMatches.length}`);
      if (h1Matches.length !== 1) errors.push(`H1 count: ${h1Matches.length}`);
      if (jsonLdMatches.length !== 1) errors.push(`JSON-LD count: ${jsonLdMatches.length}`);

      // Verify title text
      const titleText = titleMatches[0] ? titleMatches[0].replace(/<\/?title>/gi, '').trim() : '';
      if (titleText !== route.title) {
        errors.push(`Title mismatch: "${titleText}" !== "${route.title}"`);
      }

      // Verify canonical URL
      const canonicalHref = canonicalMatches[0] ? (canonicalMatches[0].match(/href=["']([^"']*)["']/i) || [])[1] : '';
      if (canonicalHref !== route.canonical) {
        errors.push(`Canonical mismatch: "${canonicalHref}" !== "${route.canonical}"`);
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

      // Verify H1 text
      const h1Text = h1Matches[0] ? unescapeHtml(h1Matches[0].replace(/<[^>]*>/g, '').trim()) : '';
      if (h1Text !== route.h1) {
        errors.push(`H1 mismatch: "${h1Text}" !== "${route.h1}"`);
      }

      // Root content crawlable check
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
        console.log(`✅ [${route.path}] 200 OK | H1: "${h1Text}" | Words: ${wordCount} | All 15 tags === 1`);
      }
    } catch (err) {
      console.error(`💥 [${route.path}] Request error:`, err.message);
      totalErrors++;
    }
  }

  // Live Static Asset Verification
  console.log('\n📦 Checking Live Static Assets on https://time.sji.one...');
  const liveAssets = [
    '/favicon.svg',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-touch-icon.png',
    '/icon-192.png',
    '/icon-512.png',
    '/manifest.webmanifest',
    '/og-image.png',
    '/twitter-card.png',
    '/icons/clock.svg',
    '/icons/analog-clock.svg',
    '/icons/world-clock.svg',
    '/icons/stopwatch.svg',
    '/icons/countdown.svg',
    '/icons/pomodoro.svg',
    '/icons/alarm.svg',
    '/icons/unix.svg',
    '/icons/timezone.svg',
    '/icons/time-diff.svg',
    '/icons/add-subtract.svg',
    '/icons/time-converter.svg',
    '/icons/military-time.svg',
    '/icons/working-hours.svg',
    '/icons/time-formats.svg',
    '/icons/date-countdown.svg',
    '/icons/meeting.svg',
    '/icons/dst-checker.svg',
    '/icons/sleep-time.svg',
    '/icons/week-number.svg',
  ];

  for (const asset of liveAssets) {
    try {
      const assetUrl = `https://time.sji.one${asset}`;
      const res = await fetch(assetUrl);
      if (res.status === 200) {
        console.log(`   ✅ [200 OK] ${asset} (${res.headers.get('content-type')})`);
      } else {
        console.error(`   ❌ [${res.status}] ${asset}`);
        totalErrors++;
      }
    } catch (err) {
      console.error(`   💥 ${asset}: ${err.message}`);
      totalErrors++;
    }
  }

  console.log('\n' + '='.repeat(65));
  if (totalErrors === 0) {
    console.log(`🎉 PRODUCTION VERIFICATION PASSED FOR ALL ${routes.length} ROUTES!`);
  } else {
    console.warn(`⚠️ PRODUCTION VERIFICATION completed with ${totalErrors} issue(s). Deployment might still be propagating.`);
  }
}

verifyProduction();
