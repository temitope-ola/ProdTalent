// Générateur de sitemap dynamique pour ProdTalent

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const staticUrls: SitemapUrl[] = [
  // Pages principales
  {
    loc: 'https://prodtalent.com',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0
  },
  {
    loc: 'https://prodtalent.com/register',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.9
  },
  {
    loc: 'https://prodtalent.com/jobs',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 0.9
  },
  {
    loc: 'https://prodtalent.com/talents',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 0.8
  },
  // Pages légales
  {
    loc: 'https://prodtalent.com/legal',
    lastmod: '2025-09-08',
    changefreq: 'monthly',
    priority: 0.4
  },
  {
    loc: 'https://prodtalent.com/privacy',
    lastmod: '2025-09-08',
    changefreq: 'monthly',
    priority: 0.4
  },
  {
    loc: 'https://prodtalent.com/terms',
    lastmod: '2025-09-08',
    changefreq: 'monthly',
    priority: 0.4
  },
  {
    loc: 'https://prodtalent.com/cookies',
    lastmod: '2025-09-08',
    changefreq: 'monthly',
    priority: 0.3
  },
  {
    loc: 'https://prodtalent.com/contact',
    lastmod: '2025-09-08',
    changefreq: 'monthly',
    priority: 0.6
  }
];

// Fonction pour générer des URLs dynamiques (jobs, profiles)
export const generateJobUrls = (jobs: any[]): SitemapUrl[] => {
  return jobs.map(job => ({
    loc: `https://prodtalent.com/jobs/${job.id}`,
    lastmod: job.updatedAt || job.createdAt || new Date().toISOString().split('T')[0],
    changefreq: 'weekly' as const,
    priority: 0.7
  }));
};

export const generateTalentUrls = (talents: any[]): SitemapUrl[] => {
  return talents.map(talent => ({
    loc: `https://prodtalent.com/talents/${talent.id}`,
    lastmod: talent.updatedAt || new Date().toISOString().split('T')[0],
    changefreq: 'weekly' as const,
    priority: 0.6
  }));
};

// Génération du XML du sitemap
export const generateSitemapXML = (urls: SitemapUrl[]): string => {
  const urlElements = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${urlElements}
</urlset>`;
};

// Sitemap index pour diviser les gros sitemaps
export const generateSitemapIndex = (sitemapFiles: string[]): string => {
  const sitemapElements = sitemapFiles.map(file => `
  <sitemap>
    <loc>https://prodtalent.com/${file}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapElements}
</sitemapindex>`;
};