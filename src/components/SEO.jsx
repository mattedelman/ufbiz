import { Helmet } from 'react-helmet-async'

function SEO({ 
  title, 
  description, 
  keywords, 
  canonical,
  ogImage,
  type = 'website',
  structuredData
}) {
  const siteUrl = 'https://ufbiz.com'
  const fullTitle = title ? `${title} | UFbiz` : 'UFbiz - Business Resources at UF'
  const fullDescription = description || 'Discover 50+ business organizations, programs, and events at the University of Florida. Connect with the UF business community, find networking opportunities, and grow your career.'
  const fullKeywords = keywords || 'UF business, University of Florida business organizations, UF business clubs, UF business events, UF business programs, UF networking, UF career resources'
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl
  const fullOgImage = ogImage || `${siteUrl}/og-image.jpg`

  // Default organization structured data
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "UFbiz",
    "alternateName": "UF Business Resources",
    "url": siteUrl,
    "description": fullDescription,
    "publisher": {
      "@type": "Person",
      "name": "Matthew Edelman"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/clubs?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  const finalStructuredData = structuredData || defaultStructuredData

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content="Matthew Edelman" />
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="UFbiz" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  )
}

export default SEO

