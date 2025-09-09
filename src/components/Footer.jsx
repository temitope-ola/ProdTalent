import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#111',
      borderTop: '1px solid #333',
      padding: '20px 0',
      marginTop: 'auto',
      color: '#888',
      fontSize: '12px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Liens légaux */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <a 
            href="/privacy" 
            style={{ 
              color: '#888', 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#61bfac'}
            onMouseLeave={(e) => e.target.style.color = '#888'}
          >
            Politique de confidentialité
          </a>
          <span style={{ color: '#555' }}>|</span>
          
          <a 
            href="/terms" 
            style={{ 
              color: '#888', 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#61bfac'}
            onMouseLeave={(e) => e.target.style.color = '#888'}
          >
            Conditions générales
          </a>
          <span style={{ color: '#555' }}>|</span>
          
          <a 
            href="/cookies" 
            style={{ 
              color: '#888', 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#61bfac'}
            onMouseLeave={(e) => e.target.style.color = '#888'}
          >
            Gestion des cookies
          </a>
          <span style={{ color: '#555' }}>|</span>
          
          <a 
            href="/legal" 
            style={{ 
              color: '#888', 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#61bfac'}
            onMouseLeave={(e) => e.target.style.color = '#888'}
          >
            Mentions légales
          </a>
          <span style={{ color: '#555' }}>|</span>
          
          <a 
            href="/contact" 
            style={{ 
              color: '#888', 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#61bfac'}
            onMouseLeave={(e) => e.target.style.color = '#888'}
          >
            Contact
          </a>
        </div>

        {/* Copyright et informations */}
        <div style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '11px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            Copyright © 2025 Edacy. Tous droits réservés.
          </p>
          <p style={{ margin: '0' }}>
            ProdTalent - Plateforme de recrutement tech en Afrique de l'Ouest
          </p>
        </div>

        {/* Version mobile - liens empilés */}
        <style jsx>{`
          @media (max-width: 768px) {
            .footer-links {
              flex-direction: column;
              gap: 12px;
            }
            
            .footer-links span {
              display: none;
            }
          }
        `}</style>
      </div>
    </footer>
  );
};

export default Footer;