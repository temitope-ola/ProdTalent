import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { seoData } from '../utils/seoData';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title={seoData.contact.title}
        description={seoData.contact.description}
        keywords={seoData.contact.keywords}
        url="https://prodtalent.com/contact"
        type="website"
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
              border: 'none',
              color: '#61bfac',
              padding: '12px 24px',
              borderRadius: '4px',
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
          Contactez-nous
        </h1>
        
        <div style={{ lineHeight: '1.6', fontSize: '16px' }}>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Nous sommes là pour vous aider
            </h2>
            <p>
              L'équipe ProdTalent by Edacy est à votre disposition pour répondre 
              à toutes vos questions concernant notre plateforme de recrutement 
              tech en Afrique de l'Ouest.
            </p>
          </section>

          <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: '1fr 1fr' }}>
            <section>
              <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
                Informations générales
              </h2>
              <div style={{ backgroundColor: '#020202', padding: '20px', borderRadius: '4px' }}>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#ffcc00' }}>Email principal :</strong><br />
                  admin@prodtalent.com
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#ffcc00' }}>Entreprise :</strong><br />
                  Edacy
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#ffcc00' }}>Localisation :</strong><br />
                  Dakar, Sénégal
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#ffcc00' }}>Site web :</strong><br />
                  <a href="https://prodtalent.com" style={{ color: '#61bfac', textDecoration: 'none' }}>
                    https://prodtalent.com
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
                Support spécialisé
              </h2>
              <div style={{ backgroundColor: '#020202', padding: '20px', borderRadius: '4px' }}>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#ffcc00' }}>Support technique :</strong><br />
                  admin@prodtalent.com
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#ffcc00' }}>Données personnelles :</strong><br />
                  admin@prodtalent.com
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#ffcc00' }}>Cookies :</strong><br />
                  admin@prodtalent.com
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#ffcc00' }}>Partenariats :</strong><br />
                  admin@prodtalent.com
                </p>
              </div>
            </section>
          </div>

          <section style={{ marginTop: '40px', marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Types de demandes
            </h2>
            
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              <div style={{ backgroundColor: '#020202', padding: '20px', borderRadius: '4px', borderLeft: '4px solid #61bfac' }}>
                <h3 style={{ color: '#ffcc00', fontSize: '18px', marginBottom: '10px' }}>
                  Pour les Talents
                </h3>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>Aide à la création de profil</li>
                  <li>Questions sur les recommandations</li>
                  <li>Problèmes de connexion</li>
                  <li>Coaching carrière</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#020202', padding: '20px', borderRadius: '4px', borderLeft: '4px solid #ffcc00' }}>
                <h3 style={{ color: '#61bfac', fontSize: '18px', marginBottom: '10px' }}>
                  Pour les Recruteurs
                </h3>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>Publication d'offres</li>
                  <li>Gestion des candidatures</li>
                  <li>Recherche de talents</li>
                  <li>Services premium</li>
                </ul>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Horaires de réponse
            </h2>
            <div style={{ 
              backgroundColor: '#020202', 
              padding: '20px', 
              borderRadius: '4px',
              borderLeft: '4px solid #61bfac'
            }}>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Lundi - Vendredi :</strong> 8h00 - 18h00 (GMT)
              </p>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Temps de réponse moyen :</strong> 24-48 heures
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
                Pour les urgences techniques, nous nous efforçons de répondre 
                dans les 6 heures en jours ouvrés.
              </p>
            </div>
          </section>

          <section>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Réseaux sociaux
            </h2>
            <p style={{ marginBottom: '15px' }}>
              Suivez-nous pour les dernières actualités et offres :
            </p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <a href="#" style={{ 
                color: '#61bfac', 
                textDecoration: 'none',
                padding: '8px 16px',
                backgroundColor: '#020202',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                LinkedIn
              </a>
              <a href="#" style={{ 
                color: '#61bfac', 
                textDecoration: 'none',
                padding: '8px 16px',
                backgroundColor: '#020202',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                Twitter
              </a>
              <a href="#" style={{ 
                color: '#61bfac', 
                textDecoration: 'none',
                padding: '8px 16px',
                backgroundColor: '#020202',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                Instagram
              </a>
            </div>
          </section>
        </div>

        <div style={{ 
          marginTop: '40px', 
          padding: '20px',
          backgroundColor: '#020202',
          borderRadius: '4px',
          borderLeft: '4px solid #61bfac'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
            <strong>Nous parlons :</strong> Français, Anglais, Wolof<br />
            <strong>Dernière mise à jour :</strong> 8 septembre 2025
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
    </>
  );
};

export default ContactPage;