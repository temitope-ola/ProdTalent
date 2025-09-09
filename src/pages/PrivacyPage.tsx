import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { seoData } from '../utils/seoData';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title={seoData.privacy.title}
        description={seoData.privacy.description}
        keywords={seoData.privacy.keywords}
        url="https://prodtalent.com/privacy"
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
          Politique de Confidentialité
        </h1>
        
        <div style={{ lineHeight: '1.6', fontSize: '16px' }}>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              1. Collecte des informations
            </h2>
            <p style={{ marginBottom: '15px' }}>
              ProdTalent by Edacy collecte les informations que vous nous fournissez directement, 
              notamment lorsque vous créez un compte, complétez votre profil, ou utilisez nos services.
            </p>
            <p>
              Nous collectons également automatiquement certaines informations techniques 
              lors de votre utilisation de notre plateforme.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              2. Utilisation des données
            </h2>
            <p style={{ marginBottom: '15px' }}>
              Vos données personnelles sont utilisées pour :
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Fournir et améliorer nos services de recrutement</li>
              <li>Faciliter les connexions entre talents et recruteurs</li>
              <li>Personnaliser votre expérience sur la plateforme</li>
              <li>Vous envoyer des notifications pertinentes</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              3. Partage des informations
            </h2>
            <p>
              Nous ne vendons jamais vos données personnelles. Nous partageons certaines 
              informations uniquement dans le cadre de nos services de mise en relation 
              professionnelle, avec votre consentement explicite.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              4. Sécurité des données
            </h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
              appropriées pour protéger vos données contre l'accès non autorisé, 
              la modification, la divulgation ou la destruction.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              5. Vos droits
            </h2>
            <p style={{ marginBottom: '15px' }}>
              Conformément au RGPD et aux lois locales, vous disposez des droits suivants :
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              6. Contact
            </h2>
            <p>
              Pour toute question concernant cette politique de confidentialité 
              ou l'exercice de vos droits, contactez-nous à : 
              <strong style={{ color: '#ffcc00' }}> admin@prodtalent.com</strong>
            </p>
          </section>
        </div>

        <div style={{ 
          marginTop: '40px', 
          padding: '20px',
          backgroundColor: '#020202',
          borderRadius: '8px',
          borderLeft: '4px solid #61bfac'
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

export default PrivacyPage;