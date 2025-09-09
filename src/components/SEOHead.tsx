import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'job';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
  structuredData?: any;
}

const SEOHead: React.FC<SEOProps> = ({
  title = "ProdTalent by Edacy - Plateforme de recrutement tech en Afrique de l'Ouest",
  description = "ProdTalent relie talents africains et entreprises tech. Découvrez des développeurs IA, des experts machine learning et accélérez votre carrière ou renforcez vos équipes.",
  keywords = [
    'recrutement tech afrique',
    'talent développeur IA', 
    'formation intelligence artificielle',
    'coaching carrière tech',
    'emploi tech Sénégal',
    'Côte d\'Ivoire',
    'startup africaine',
    'développeur machine learning',
    'formation digitale'
  ],
  image = "https://prodtalent.com/prodtalent-social.jpg",
  url = "https://prodtalent.com",
  type = "website",
  author = "Edacy",
  publishedTime,
  modifiedTime,
  noIndex = false,
  canonicalUrl,
  structuredData
}) => {
  const fullTitle = title.includes('ProdTalent') ? title : `${title} | ProdTalent by Edacy`;
  const keywordsString = keywords.join(', ');
  
  return (
    <Helmet>
      {/* Title et metas de base */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={author} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="ProdTalent by Edacy" />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Article specific OG tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@Edacy" />
      <meta name="twitter:site" content="@ProdTalent" />
      
      {/* Geo targeting pour l'Afrique de l'Ouest */}
      <meta name="geo.region" content="SN" />
      <meta name="geo.region" content="CI" />
      <meta name="geo.region" content="ML" />
      <meta name="geo.region" content="BF" />
      <meta name="geo.placename" content="Dakar, Abidjan, Bamako, Ouagadougou" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;