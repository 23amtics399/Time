import { useEffect } from 'react';
import { ROUTES_SEO, BASE_URL, SITE_NAME } from '../data/seoConfig';

/**
 * Idempotently updates or creates a single head tag, ensuring no duplicates.
 */
function setHeadTag(selector, tagName, attributes, valueAttribute, value) {
  if (typeof document === 'undefined') return;

  const elements = document.querySelectorAll(selector);
  // Remove any duplicates
  for (let i = 1; i < elements.length; i++) {
    elements[i].remove();
  }

  let el = elements[0];
  if (!el) {
    el = document.createElement(tagName);
    Object.entries(attributes).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute(valueAttribute, value);
}

/**
 * Client-side SEO manager.
 * Returns null to prevent React 19 document metadata hoisting collisions.
 * In-place updates existing head elements so metadata remains strictly 1 copy.
 */
export default function SEO({ path = '/', title, description, jsonLd }) {
  const config = ROUTES_SEO[path] || {};

  const resolvedTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`)
    : (config.title || `${SITE_NAME} — Free Online Time Utilities`);

  const resolvedDescription = description || config.description || '';
  const resolvedCanonical = config.canonical || `${BASE_URL}${path === '/' ? '/' : path}`;
  const resolvedOg = config.og || {
    title: resolvedTitle,
    description: resolvedDescription,
    url: resolvedCanonical,
    type: 'website',
    siteName: SITE_NAME,
  };
  const resolvedTwitter = config.twitter || {
    card: 'summary_large_image',
    title: resolvedTitle,
    description: resolvedDescription,
  };
  const resolvedJsonLd = jsonLd || config.jsonLd;

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Single Title
    const titles = document.querySelectorAll('title');
    for (let i = 1; i < titles.length; i++) {
      titles[i].remove();
    }
    if (titles.length === 0) {
      const t = document.createElement('title');
      t.textContent = resolvedTitle;
      document.head.appendChild(t);
    } else {
      titles[0].textContent = resolvedTitle;
    }
    document.title = resolvedTitle;

    // 2. Meta description
    setHeadTag('meta[name="description"]', 'meta', { name: 'description' }, 'content', resolvedDescription);

    // 3. Canonical link
    setHeadTag('link[rel="canonical"]', 'link', { rel: 'canonical' }, 'href', resolvedCanonical);

    // 4. Open Graph
    setHeadTag('meta[property="og:title"]', 'meta', { property: 'og:title' }, 'content', resolvedOg.title || resolvedTitle);
    setHeadTag('meta[property="og:description"]', 'meta', { property: 'og:description' }, 'content', resolvedOg.description || resolvedDescription);
    setHeadTag('meta[property="og:url"]', 'meta', { property: 'og:url' }, 'content', resolvedOg.url || resolvedCanonical);
    setHeadTag('meta[property="og:type"]', 'meta', { property: 'og:type' }, 'content', resolvedOg.type || 'website');
    setHeadTag('meta[property="og:site_name"]', 'meta', { property: 'og:site_name' }, 'content', resolvedOg.siteName || SITE_NAME);
    setHeadTag('meta[property="og:image"]', 'meta', { property: 'og:image' }, 'content', resolvedOg.image || `${BASE_URL}/og-image.png`);

    // 5. Twitter Card
    setHeadTag('meta[name="twitter:card"]', 'meta', { name: 'twitter:card' }, 'content', resolvedTwitter.card || 'summary_large_image');
    setHeadTag('meta[name="twitter:title"]', 'meta', { name: 'twitter:title' }, 'content', resolvedTwitter.title || resolvedTitle);
    setHeadTag('meta[name="twitter:description"]', 'meta', { name: 'twitter:description' }, 'content', resolvedTwitter.description || resolvedDescription);
    setHeadTag('meta[name="twitter:image"]', 'meta', { name: 'twitter:image' }, 'content', resolvedTwitter.image || resolvedOg.image || `${BASE_URL}/og-image.png`);

    // 6. JSON-LD structured data
    if (resolvedJsonLd) {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (let i = 1; i < scripts.length; i++) {
        scripts[i].remove();
      }
      let script = scripts[0];
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(resolvedJsonLd);
    }
  }, [resolvedTitle, resolvedDescription, resolvedCanonical, resolvedOg, resolvedTwitter, resolvedJsonLd]);

  return null;
}
