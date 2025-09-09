import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { seoData } from '../utils/seoData';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title={seoData.terms.title}
        description={seoData.terms.description}
        keywords={seoData.terms.keywords}
        url="https://prodtalent.com/terms"
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
          Conditions Générales d'Utilisation
        </h1>
        
        <div style={{ lineHeight: '1.6', fontSize: '16px' }}>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              1. Acceptation des conditions
            </h2>
            <p>
              En utilisant ProdTalent by Edacy, vous acceptez d'être lié par ces 
              conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, 
              veuillez ne pas utiliser notre service.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              2. Description du service
            </h2>
            <p style={{ marginBottom: '15px' }}>
              ProdTalent est une plateforme de recrutement tech spécialisée dans 
              la mise en relation entre talents africains et entreprises. Nos services incluent :
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Création et gestion de profils professionnels</li>
              <li>Mise en relation talents/recruteurs</li>
              <li>Services de coaching carrière</li>
              <li>Formation et développement professionnel</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              3. Inscription et compte utilisateur
            </h2>
            <p style={{ marginBottom: '15px' }}>
              Pour utiliser certains services, vous devez créer un compte. Vous vous engagez à :
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Fournir des informations exactes et complètes</li>
              <li>Maintenir vos informations à jour</li>
              <li>Protéger la confidentialité de vos identifiants</li>
              <li>Nous notifier immédiatement tout usage non autorisé</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              4. Utilisation acceptable
            </h2>
            <p style={{ marginBottom: '15px' }}>
              Vous acceptez de ne pas utiliser notre service pour :
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Publier du contenu illégal, trompeur ou inapproprié</li>
              <li>Harceler ou discriminer d'autres utilisateurs</li>
              <li>Violer les droits de propriété intellectuelle</li>
              <li>Perturber le fonctionnement de la plateforme</li>
              <li>Utiliser des moyens automatisés non autorisés</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              5. Contenu utilisateur
            </h2>
            <p>
              Vous conservez tous les droits sur le contenu que vous publiez, mais 
              vous nous accordez une licence non exclusive pour utiliser ce contenu 
              dans le cadre de nos services. Vous êtes responsable de la légalité 
              et de l'exactitude de votre contenu.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              6. Propriété intellectuelle
            </h2>
            <p>
              ProdTalent, Edacy et tous les contenus associés sont protégés par 
              des droits d'auteur, marques déposées et autres droits de propriété 
              intellectuelle. Toute utilisation non autorisée est interdite.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              7. Limitation de responsabilité
            </h2>
            <p>
              ProdTalent est fourni "en l'état". Nous ne garantissons pas l'obtention 
              d'emploi ou de candidats parfaits. Notre responsabilité est limitée 
              dans les conditions prévues par la loi applicable.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              8. Modifications des conditions
            </h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. 
              Les modifications prennent effet dès leur publication. L'utilisation 
              continue du service après modification constitue une acceptation.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#61bfac', fontSize: '24px', marginBottom: '15px' }}>
              9. Contact et réclamations
            </h2>
            <p>
              Pour toute question concernant ces conditions ou pour signaler 
              un problème : <strong style={{ color: '#ffcc00' }}>admin@prodtalent.com</strong>
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
            <strong>Dernière mise à jour :</strong> 8 septembre 2025<br />
            <strong>Droit applicable :</strong> République du Sénégal
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default TermsPage;