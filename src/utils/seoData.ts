// SEO Data pour les différentes pages de ProdTalent

export const seoData = {
  // Page d'accueil
  home: {
    title: "ProdTalent by Edacy - Plateforme de recrutement tech en Afrique de l'Ouest",
    description: "Découvrez les meilleurs talents tech africains. Formation IA, coaching carrière, recrutement développeurs. Accélérez votre carrière ou renforcez vos équipes avec ProdTalent.",
    keywords: [
      'recrutement tech afrique',
      'talent développeur IA',
      'formation intelligence artificielle',
      'coaching carrière tech',
      'emploi tech Sénégal',
      'startup africaine',
      'développeur machine learning',
      'plateforme recrutement Dakar',
      'Edacy formation',
      'tech jobs afrique de l\'ouest'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ProdTalent by Edacy",
      "url": "https://prodtalent.com",
      "logo": "https://prodtalent.vercel.app/favicon.png",
      "description": "Plateforme de recrutement tech qui révèle le potentiel des talents africains",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dakar",
        "addressCountry": "SN",
        "addressRegion": "Afrique de l'Ouest"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "admin@prodtalent.com",
        "contactType": "customer support"
      },
      "sameAs": [
        "https://www.linkedin.com/company/edacy",
        "https://twitter.com/edacy"
      ]
    }
  },

  // Inscription
  register: {
    title: "Inscription gratuite - Rejoignez ProdTalent",
    description: "Créez votre profil ProdTalent gratuitement. Talents tech : trouvez votre prochaine opportunité. Recruteurs : découvrez les meilleurs développeurs africains.",
    keywords: [
      'inscription ProdTalent',
      'créer profil développeur',
      'rejoindre plateforme tech',
      's\'inscrire recrutement afrique',
      'compte gratuit talent tech'
    ]
  },

  // Dashboard talent
  talentDashboard: {
    title: "Mon Dashboard Talent - ProdTalent",
    description: "Gérez votre profil, consultez vos recommandations et candidatures. Accédez aux meilleures opportunités tech en Afrique de l'Ouest.",
    keywords: [
      'dashboard talent',
      'profil développeur',
      'recommandations emploi tech',
      'candidatures tech afrique'
    ],
    noIndex: true // Page privée
  },

  // Dashboard recruteur
  recruiterDashboard: {
    title: "Mon Dashboard Recruteur - ProdTalent",
    description: "Publiez vos offres d'emploi tech, découvrez des talents qualifiés et gérez vos recrutements en Afrique de l'Ouest.",
    keywords: [
      'dashboard recruteur',
      'publier offre emploi tech',
      'recruter développeur afrique',
      'gestion candidatures'
    ],
    noIndex: true // Page privée
  },

  // Liste des talents
  talents: {
    title: "Talents Tech Africains - Développeurs IA & Machine Learning",
    description: "Découvrez notre communauté de développeurs africains experts en IA, machine learning, développement web et mobile. Talents formés par Edacy.",
    keywords: [
      'développeur IA afrique',
      'talent machine learning',
      'programmeur africain',
      'expert tech Sénégal',
      'développeur web Côte d\'Ivoire',
      'ingénieur logiciel afrique'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Talents Tech Africains sur ProdTalent",
      "description": "Liste des développeurs et experts tech africains disponibles pour recrutement",
      "url": "https://prodtalent.com/talents"
    }
  },

  // Offres d'emploi
  jobs: {
    title: "Offres d'Emploi Tech en Afrique - ProdTalent",
    description: "Trouvez votre prochain poste en développement IA, machine learning, web ou mobile. Opportunités tech dans toute l'Afrique de l'Ouest.",
    keywords: [
      'offres emploi tech afrique',
      'job développeur IA',
      'recrutement machine learning',
      'emploi développeur Sénégal',
      'startup tech jobs',
      'opportunités tech Dakar'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "name": "Offres d'Emploi Tech",
      "description": "Découvrez les meilleures opportunités tech en Afrique de l'Ouest",
      "hiringOrganization": {
        "@type": "Organization",
        "name": "ProdTalent by Edacy"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressRegion": "Afrique de l'Ouest",
          "addressCountry": ["SN", "CI", "ML", "BF"]
        }
      }
    }
  },

  // Coaching/Formation
  coaching: {
    title: "Coaching Carrière Tech - Accélérez votre évolution",
    description: "Bénéficiez d'un coaching personnalisé pour booster votre carrière tech. Sessions avec nos experts Edacy, formation continue et accompagnement professionnel.",
    keywords: [
      'coaching carrière tech',
      'formation développeur',
      'mentor tech afrique',
      'évolution professionnelle IT',
      'conseil carrière développeur',
      'accompagnement tech'
    ]
  },

  // Pages légales avec SEO optimisé
  legal: {
    title: "Mentions Légales - ProdTalent by Edacy",
    description: "Informations légales de ProdTalent, plateforme de recrutement tech basée au Sénégal. Edacy, innovation en formation et recrutement digital.",
    keywords: ['mentions légales ProdTalent', 'informations légales Edacy', 'société recrutement Sénégal']
  },

  privacy: {
    title: "Politique de Confidentialité - Protection de vos données",
    description: "Comment ProdTalent protège vos données personnelles. Conformité RGPD et législation sénégalaise sur la protection des données.",
    keywords: ['confidentialité ProdTalent', 'protection données personnelles', 'RGPD recrutement', 'vie privée plateforme tech']
  },

  terms: {
    title: "Conditions Générales d'Utilisation - ProdTalent",
    description: "Conditions d'utilisation de la plateforme ProdTalent. Droits et devoirs des talents et recruteurs sur notre plateforme de recrutement tech.",
    keywords: ['CGU ProdTalent', 'conditions utilisation', 'règles plateforme recrutement', 'termes service tech']
  },

  contact: {
    title: "Contactez ProdTalent - Support et Partenariats",
    description: "Contactez l'équipe ProdTalent pour toute question, support technique ou opportunité de partenariat. Basés à Dakar, présents en Afrique de l'Ouest.",
    keywords: ['contact ProdTalent', 'support client Edacy', 'partenariat recrutement', 'équipe Dakar']
  }
};

// Fonction pour générer des structured data dynamiques
export const generateJobStructuredData = (job: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.createdAt,
    "employmentType": job.employmentType || "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.companyName || "Entreprise partenaire ProdTalent",
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
        "value": job.salary
      }
    } : undefined
  };
};

export const generateProfileStructuredData = (profile: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": `${profile.firstName} ${profile.lastName}`,
    "jobTitle": profile.title || "Développeur Tech",
    "description": profile.bio,
    "skills": profile.skills || [],
    "worksFor": {
      "@type": "Organization",
      "name": "ProdTalent Community"
    },
    "alumniOf": profile.education ? {
      "@type": "Organization", 
      "name": profile.education
    } : undefined
  };
};