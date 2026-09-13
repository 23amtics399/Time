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
      const twCardMatches = html.match(/<meta\s+[^>]*name=["']twitter:card["'][^>]*>/gi) || [];
      const twTitleMatches = html.match(/<meta\s+[^>]*name=["']twitter:title["'][^>]*>/gi) || [];
      const twDescMatches = html.match(/<meta\s+[^>]*name=["']twitter:description["'][^>]*>/gi) || [];
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
      if (twCardMatches.length !== 1) errors.push(`twitter:card count: ${twCardMatches.length}`);
      if (twTitleMatches.length !== 1) errors.push(`twitter:title count: ${twTitleMatches.length}`);
      if (twDescMatches.length !== 1) errors.push(`twitter:description count: ${twDescMatches.length}`);
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

      // Verify H1 text
      const h1Text = h1Matches[0] ? h1Matches[0].replace(/<[^>]*>/g, '').trim() : '';
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
        console.log(`✅ [${route.path}] 200 OK | H1: "${h1Text}" | Words: ${wordCount} | All tags === 1`);
      }
    } catch (err) {
      console.error(`💥 [${route.path}] Request error:`, err.message);
      totalErrors++;
    }
  }

  console.log('\n' + '='.repeat(65));
  if (totalErrors === 0) {
    console.log('🎉 PRODUCTION VERIFICATION PASSED FOR ALL 14 ROUTES!');
  } else {
    console.warn(`⚠️ PRODUCTION VERIFICATION completed with ${totalErrors} issue(s). Deployment might still be propagating.`);
  }
}

verifyProduction();
