import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { seoData } from '../utils/seoData';

const LegalPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title={seoData.legal.title}
        description={seoData.legal.description}
        keywords={seoData.legal.keywords}
        url="https://prodtalent.com/legal"
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
          Mentions Légales
        </h1>
        
        <div style={{ lineHeight: '1.6', fontSize: '16px' }}>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Éditeur du site
            </h2>
            <div style={{ backgroundColor: '#020202', padding: '20px', borderRadius: '4px' }}>
              <p><strong>Dénomination sociale :</strong> Edacy</p>
              <p><strong>Produit :</strong> ProdTalent</p>
              <p><strong>Siège social :</strong> Dakar, Sénégal</p>
              <p><strong>Email :</strong> admin@prodtalent.com</p>
              <p><strong>Site web :</strong> https://prodtalent.com</p>
            </div>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Directeur de la publication
            </h2>
            <p>
              La direction de la publication est assurée par l'équipe dirigeante d'Edacy.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Hébergement
            </h2>
            <div style={{ backgroundColor: '#020202', padding: '20px', borderRadius: '4px' }}>
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
              <p><strong>Site web :</strong> https://vercel.com</p>
            </div>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Propriété intellectuelle
            </h2>
            <p style={{ marginBottom: '15px' }}>
              L'ensemble de ce site relève de la législation sénégalaise et 
              internationale sur le droit d'auteur et la propriété intellectuelle.
            </p>
            <p>
              Tous les droits de reproduction sont réservés, y compris pour les 
              documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Données personnelles
            </h2>
            <p>
              Conformément à la loi n° 2008-12 du 25 janvier 2008 sur la protection 
              des données à caractère personnel du Sénégal et au RGPD européen, 
              vous disposez d'un droit d'accès, de rectification et de suppression 
              des données vous concernant.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Cookies
            </h2>
            <p>
              Ce site utilise des cookies pour améliorer l'expérience utilisateur 
              et analyser le trafic. En continuant votre navigation, vous acceptez 
              l'utilisation de ces cookies.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              Droit applicable
            </h2>
            <p>
              Le présent site est soumis au droit sénégalais. En cas de litige, 
              les tribunaux sénégalais seront seuls compétents.
            </p>
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
            <strong>Document mis à jour le :</strong> 8 septembre 2025
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default LegalPage;