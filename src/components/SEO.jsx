import { Helmet } from 'react-helmet-async'

function SEO({ 
  title, 
  description, 
  keywords, 
  canonical,
  ogImage,
  type = 'website'
}) {
  const siteUrl = 'https://ufbiz.com'
  const fullTitle = title ? `${title} | UFbiz` : 'UFbiz - Business Resources at UF'
  const fullDescription = description || 'Discover 50+ business organizations, programs, and events at the University of Florida. Connect with the UF business community, find networking opportunities, and grow your career.'
  const fullKeywords = keywords || 'UF business, University of Florida business organizations, UF business clubs, UF business events, UF business programs, UF networking, UF career resources'
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl
  const fullOgImage = ogImage || `${siteUrl}/og-image.jpg`

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="UFbiz" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonical} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
      <meta property="twitter:image" content={fullOgImage} />
    </Helmet>
  )
}

export default SEO

