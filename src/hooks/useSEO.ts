import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Hook pour gérer les analytics et tracking SEO
export const useSEO = () => {
  const location = useLocation();

  useEffect(() => {
    // Google Analytics 4 - si configuré
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname + location.search,
        page_title: document.title
      });
    }

    // Meta viewport dynamique pour mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, shrink-to-fit=no');
    }

    // Performance hints
    const performanceHints = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
      { rel: 'dns-prefetch', href: 'https://prodtalent.com' }
    ];

    performanceHints.forEach(hint => {
      const existingLink = document.querySelector(`link[href="${hint.href}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossorigin) {
          link.crossOrigin = hint.crossorigin;
        }
        document.head.appendChild(link);
      }
    });

  }, [location]);

  return {
    trackPageView: (pageName: string) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_title: pageName,
          page_location: window.location.href,
          page_path: location.pathname
        });
      }
    },
    
    trackEvent: (eventName: string, parameters?: any) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, parameters);
      }
    }
  };
};

// Hook pour optimiser les images
export const useImageOptimization = () => {
  useEffect(() => {
    // Lazy loading des images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          }
        });
      });

      // Observer toutes les images lazy
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }, []);
};

// Hook pour les Web Vitals et Core Web Vitals
export const useWebVitals = () => {
  useEffect(() => {
    const reportWebVitals = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
          
          getCLS(metric => {
            // Envoyer à analytics
            console.log('CLS:', metric);
          });
          
          getFID(metric => {
            console.log('FID:', metric);
          });
          
          getFCP(metric => {
            console.log('FCP:', metric);
          });
          
          getLCP(metric => {
            console.log('LCP:', metric);
          });
          
          getTTFB(metric => {
            console.log('TTFB:', metric);
          });
        } catch (error) {
          console.log('Web Vitals not available');
        }
      }
    };

    reportWebVitals();
  }, []);
};

// Hook pour les rich snippets dynamiques
export const useRichSnippets = (type: 'organization' | 'jobPosting' | 'person', data: any) => {
  useEffect(() => {
    const scriptId = `rich-snippet-${type}`;
    
    // Supprimer l'ancien script s'il existe
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Générer les données structurées selon le type
    let structuredData = {};
    
    switch (type) {
      case 'organization':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": data.name || "ProdTalent by Edacy",
          "url": data.url || "https://prodtalent.com",
          "description": data.description
        };
        break;
      
      case 'jobPosting':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": data.title,
          "description": data.description,
          "hiringOrganization": {
            "@type": "Organization",
            "name": data.company || "ProdTalent"
          }
        };
        break;
      
      case 'person':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": data.name,
          "jobTitle": data.jobTitle
        };
        break;
    }

    // Injecter le script
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Nettoyage
    return () => {
      const script = document.getElementById(scriptId);
      if (script) {
        script.remove();
      }
    };
  }, [type, data]);
};