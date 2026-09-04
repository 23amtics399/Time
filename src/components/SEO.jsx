import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Time Tools';
const BASE_URL = 'https://time.sji.one';

/**
 * SEO component — wraps react-helmet-async for per-page meta.
 * @param {string} title        - Page title (without site name suffix)
 * @param {string} description  - Meta description
 * @param {string} path         - URL path, e.g. '/stopwatch'
 * @param {object} jsonLd       - Optional JSON-LD structured data object
 */
export default function SEO({ title, description, path = '', jsonLd }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Free Online Time Utilities`;
  const canonical = `${BASE_URL}${path}`;

  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: fullTitle,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    description: description,
    url: canonical,
    isAccessibleForFree: true,
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />

      <script type="application/ld+json">
        {JSON.stringify(jsonLd || defaultJsonLd)}
      </script>
    </Helmet>
  );
}
