import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { seoData } from '../utils/seoData';

const CookiesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Gestion des Cookies - ProdTalent"
        description="Politique de cookies de ProdTalent. Comment nous utilisons les cookies pour améliorer votre expérience utilisateur."
        keywords={['cookies ProdTalent', 'politique cookies', 'gestion cookies']}
        url="https://prodtalent.com/cookies"
      />
      
    <div style={{
      minHeight: '80vh',
      backgroundColor: '#000',
      color: '#f5f5f7',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Bouton retour */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #61bfac',
              color: '#61bfac',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#61bfac';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#61bfac';
            }}
          >
            ← Retour à l'accueil
          </button>
        </div>

        <h1 style={{ 
          color: '#ffcc00', 
          marginBottom: '30px',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          Gestion des Cookies
        </h1>
        
        <div style={{ lineHeight: '1.6', fontSize: '16px' }}>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Qu'est-ce qu'un cookie ?
            </h2>
            <p>
              Un cookie est un petit fichier texte stocké sur votre ordinateur ou 
              appareil mobile lorsque vous visitez ProdTalent. Les cookies nous 
              permettent d'améliorer votre expérience utilisateur et de comprendre 
              comment vous utilisez notre plateforme.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Types de cookies utilisés
            </h2>
            <div style={{ backgroundColor: '#020202', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ color: '#ffcc00', fontSize: '18px', marginBottom: '10px' }}>
                Cookies essentiels
              </h3>
              <p>
                Ces cookies sont nécessaires au fonctionnement de base du site. 
                Ils permettent la navigation, l'authentification et l'accès aux 
                zones sécurisées. Vous ne pouvez pas les désactiver.
              </p>
            </div>

            <div style={{ backgroundColor: '#020202', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ color: '#ffcc00', fontSize: '18px', marginBottom: '10px' }}>
                Cookies fonctionnels
              </h3>
              <p>
                Ces cookies mémorisent vos préférences (langue, région, paramètres) 
                pour améliorer votre expérience sur nos services.
              </p>
            </div>

            <div style={{ backgroundColor: '#020202', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#ffcc00', fontSize: '18px', marginBottom: '10px' }}>
                Cookies d'analyse
              </h3>
              <p>
                Ces cookies nous aident à comprendre comment vous utilisez 
                ProdTalent pour améliorer nos services. Ils collectent des 
                informations anonymes sur votre navigation.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Services tiers
            </h2>
            <p style={{ marginBottom: '15px' }}>
              Nous utilisons également des services tiers qui peuvent placer 
              des cookies sur votre appareil :
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Google Analytics</strong> - Analyse du trafic et du comportement</li>
              <li><strong>Firebase</strong> - Authentification et base de données</li>
              <li><strong>SendGrid</strong> - Service de messagerie</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Gérer vos cookies
            </h2>
            <p style={{ marginBottom: '15px' }}>
              Vous pouvez contrôler et gérer les cookies de plusieurs façons :
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Via les paramètres de votre navigateur</li>
              <li>En utilisant des outils de gestion des cookies</li>
              <li>En nous contactant directement</li>
            </ul>
            
            <div style={{ 
              backgroundColor: '#020202', 
              padding: '15px', 
              borderRadius: '8px', 
              marginTop: '20px',
              borderLeft: '4px solid #61bfac'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <strong>Note importante :</strong> La désactivation de certains 
                cookies peut affecter le fonctionnement de ProdTalent et limiter 
                votre expérience utilisateur.
              </p>
            </div>
          </section>

          <section>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Contact
            </h2>
            <p>
              Pour toute question sur notre utilisation des cookies, 
              contactez-nous à : <strong style={{ color: '#ffcc00' }}>admin@prodtalent.com</strong>
            </p>
          </section>
        </div>

        <div style={{ 
          marginTop: '40px', 
          padding: '20px',
          backgroundColor: '#020202',
          borderRadius: '8px',
          borderLeft: '4px solid #ffcc00'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
            <strong>Dernière mise à jour :</strong> 8 septembre 2025
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default CookiesPage;