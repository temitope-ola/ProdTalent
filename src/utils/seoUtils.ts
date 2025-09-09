// Utilitaires SEO avancés pour ProdTalent

// Fonction pour générer des meta descriptions optimisées
export const generateMetaDescription = (
  type: 'job' | 'profile' | 'company' | 'general',
  data: any
): string => {
  const templates = {
    job: (job: any) => 
      `${job.title} chez ${job.company || 'entreprise partenaire'} - ${job.location || 'Afrique de l\'Ouest'}. ${job.salary ? `Salaire: ${job.salary}. ` : ''}Rejoignez ProdTalent pour postuler.`,
    
    profile: (profile: any) => 
      `${profile.name || 'Talent tech'} - ${profile.title || 'Développeur'}. ${profile.skills?.slice(0, 3).join(', ') || 'Expert tech'} disponible sur ProdTalent.`,
    
    company: (company: any) => 
      `${company.name} recrute des talents tech africains via ProdTalent. ${company.sector || 'Secteur innovant'}, ${company.size || 'équipe dynamique'}.`,
    
    general: () => 
      'Découvrez les meilleurs talents tech africains sur ProdTalent. Formation IA, coaching carrière, recrutement développeurs en Afrique de l\'Ouest.'
  };

  return templates[type](data);
};

// Optimisation des mots-clés par région
export const getRegionalKeywords = (baseKeywords: string[], region?: string): string[] => {
  const regionalTerms: Record<string, string[]> = {
    'senegal': ['Sénégal', 'Dakar', 'sénégalais', 'tech Sénégal'],
    'cotedivoire': ['Côte d\'Ivoire', 'Abidjan', 'ivoirien', 'tech Abidjan'],
    'mali': ['Mali', 'Bamako', 'malien', 'tech Mali'],
    'burkina': ['Burkina Faso', 'Ouagadougou', 'burkinabè', 'tech Burkina'],
    'togo': ['Togo', 'Lomé', 'togolais', 'tech Togo'],
    'benin': ['Bénin', 'Cotonou', 'béninois', 'tech Bénin']
  };

  let keywords = [...baseKeywords];
  
  if (region && regionalTerms[region.toLowerCase()]) {
    keywords = keywords.concat(regionalTerms[region.toLowerCase()]);
  }
  
  // Ajouter les termes génériques d'Afrique de l'Ouest
  keywords = keywords.concat([
    'Afrique de l\'Ouest',
    'CEDEAO',
    'francophone tech',
    'startup africaine',
    'écosystème tech africain'
  ]);

  return keywords;
};

// Génération d'URL canoniques
export const generateCanonicalUrl = (path: string, params?: Record<string, string>): string => {
  let url = `https://prodtalent.com${path}`;
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Validation et nettoyage des données SEO
export const sanitizeSEOData = (data: any): any => {
  const cleanTitle = (title: string): string => {
    return title
      .replace(/<[^>]*>/g, '') // Supprimer HTML
      .replace(/\s+/g, ' ') // Normaliser espaces
      .trim()
      .substring(0, 60); // Limite Google
  };

  const cleanDescription = (desc: string): string => {
    return desc
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 155); // Limite Google
  };

  return {
    ...data,
    title: data.title ? cleanTitle(data.title) : '',
    description: data.description ? cleanDescription(data.description) : '',
    keywords: Array.isArray(data.keywords) ? data.keywords.map((k: string) => k.trim().toLowerCase()) : []
  };
};

// Structure de données pour les offres d'emploi
export const generateJobPosting = (job: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "ProdTalent",
      "value": job.id
    },
    "datePosted": job.createdAt,
    "validThrough": job.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    "employmentType": job.employmentType || "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.companyName || "Entreprise via ProdTalent",
      "sameAs": "https://prodtalent.com"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location || "Afrique de l'Ouest",
        "addressCountry": "SN"
      }
    },
    "baseSalary": job.salary ? {
      "@type": "MonetaryAmount",
      "currency": "XOF",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.salary,
        "unitText": job.salaryType || "MONTHLY"
      }
    } : undefined,
    "skills": job.skills || [],
    "qualifications": job.requirements || "Formation en développement logiciel",
    "benefits": job.benefits || "Opportunité de croissance, environnement innovant",
    "workHours": job.workHours || "Temps plein",
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": ["Sénégal", "Côte d'Ivoire", "Mali", "Burkina Faso", "Togo", "Bénin"]
    }
  };
};

// Breadcrumb structured data
export const generateBreadcrumb = (items: Array<{name: string, url: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

// FAQ structured data
export const generateFAQ = (faqs: Array<{question: string, answer: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};