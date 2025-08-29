import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailJSConfig from '../components/EmailJSConfig';
import FeaturedTalentsManager from '../components/FeaturedTalentsManager';
import { useNotifications } from '../components/NotificationManager';
import emailNotificationService from '../services/emailNotificationService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [activeSection, setActiveSection] = useState('overview');
  const [isEmailJSConfigOpen, setIsEmailJSConfigOpen] = useState(false);
  const [emailJSConfigured, setEmailJSConfigured] = useState(false);

  // Check EmailJS configuration status
  React.useEffect(() => {
    const checkEmailJSConfig = () => {
      const savedConfig = localStorage.getItem('emailjs_config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          const isConfigured = config.publicKey && config.serviceId;
          setEmailJSConfigured(isConfigured);
        } catch {
          setEmailJSConfigured(false);
        }
      } else {
        setEmailJSConfigured(false);
      }
    };
    
    checkEmailJSConfig();
    window.addEventListener('storage', checkEmailJSConfig);
    
    return () => window.removeEventListener('storage', checkEmailJSConfig);
  }, []);

  const handleLogout = () => {
    // Simple logout - just redirect to home
    navigate('/');
  };

  const handleDiagnose = async () => {
    try {
      const diagnosis = await emailNotificationService.diagnoseConfiguration();
      
      let message = '🔍 Diagnostic de la configuration EmailJS:\n\n';
      message += `📍 Public Key: ${diagnosis.publicKey ? '✅ Configurée' : '❌ Manquante'}\n`;
      message += `📍 Service ID: ${diagnosis.serviceId ? '✅ Configuré' : '❌ Manquant'}\n`;
      message += `📍 Template disponible: ${diagnosis.availableTemplate ? '✅ ' + diagnosis.availableTemplate : '❌ Aucun'}\n\n`;
      
      message += '📋 Templates configurés:\n';
      Object.entries(diagnosis.templates).forEach(([key, value]) => {
        message += `  • ${key}: ${value ? '✅' : '❌'}\n`;
      });
      
      if (!diagnosis.publicKey || !diagnosis.serviceId || !diagnosis.availableTemplate) {
        message += '\n⚠️ Configuration incomplète détectée!';
      } else {
        message += '\n✅ Configuration semble correcte. Testez maintenant!';
      }
      
      // Log pour debug
      console.log('📊 Diagnostic EmailJS:', diagnosis);
      
      showNotification({
        type: diagnosis.publicKey && diagnosis.serviceId && diagnosis.availableTemplate ? 'success' : 'warning',
        title: 'Diagnostic de configuration',
        message: message
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error);
      showNotification({
        type: 'error',
        title: 'Erreur de diagnostic',
        message: 'Impossible d\'effectuer le diagnostic'
      });
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'email', label: 'Configuration Email', icon: '📧' },
    { id: 'featured', label: 'Talents Mis en Avant', icon: '⭐' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div>
            <h2 style={{ color: '#ffcc00', marginBottom: '24px' }}>Vue d'ensemble</h2>
            
            {/* System Status Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <div style={{
                backgroundColor: '#1a1a1a',
                padding: '24px',
                borderRadius: '8px',
                border: emailJSConfigured ? '1px solid #61bfac' : '1px solid #ff6b6b'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>📧</span>
                  <h3 style={{ color: '#f5f5f7', margin: 0 }}>Notifications Email</h3>
                </div>
                <p style={{
                  color: emailJSConfigured ? '#61bfac' : '#ff6b6b',
                  margin: '8px 0',
                  fontWeight: 'bold'
                }}>
                  {emailJSConfigured ? '✅ Configuré' : '❌ Non configuré'}
                </p>
                <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
                  {emailJSConfigured 
                    ? 'Les notifications email sont actives'
                    : 'Configurez EmailJS pour activer les notifications'
                  }
                </p>
              </div>

              <div style={{
                backgroundColor: '#1a1a1a',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #333'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>⭐</span>
                  <h3 style={{ color: '#f5f5f7', margin: 0 }}>Talents Mis en Avant</h3>
                </div>
                <p style={{ color: '#ffcc00', margin: '8px 0', fontWeight: 'bold' }}>
                  ✅ Disponible
                </p>
                <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
                  Gérez les talents mis en avant sur la page d'accueil
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 style={{ color: '#f5f5f7', marginBottom: '16px' }}>Actions Rapides</h3>
              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setActiveSection('email')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: emailJSConfigured ? '#333' : '#ffcc00',
                    color: emailJSConfigured ? '#f5f5f7' : '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {emailJSConfigured ? '⚙️ Modifier Config Email' : '📧 Configurer Email'}
                </button>
                
                <button
                  onClick={() => setActiveSection('featured')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ⭐ Gérer les Talents
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'email':
        return (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ color: '#ffcc00', margin: 0 }}>Configuration Email</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setIsEmailJSConfigOpen(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ffcc00',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {emailJSConfigured ? 'Modifier Configuration' : 'Configurer EmailJS'}
                </button>
                
                <button
                  onClick={handleDiagnose}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  🔍 Diagnostiquer
                </button>
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: '#f5f5f7', marginBottom: '16px' }}>État de la configuration</h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: emailJSConfigured ? '#61bfac' : '#ff6b6b'
                }}></div>
                <span style={{ color: '#f5f5f7' }}>
                  {emailJSConfigured ? 'EmailJS configuré et prêt' : 'EmailJS non configuré'}
                </span>
              </div>
              <p style={{ color: '#888', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                {emailJSConfigured 
                  ? 'Les notifications par email sont actives. Les utilisateurs recevront des emails pour les nouveaux messages, recommandations et offres d\'emploi.'
                  : 'Configurez EmailJS pour activer les notifications automatiques par email. Cela permettra d\'envoyer des emails pour les nouveaux messages, recommandations et offres d\'emploi.'
                }
              </p>
            </div>

            {/* Email Types Info */}
            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: '#f5f5f7', marginBottom: '16px' }}>Types de notifications email</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px' }}>💬</span>
                  <div>
                    <strong style={{ color: '#ffcc00' }}>Messages</strong>
                    <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: '14px' }}>
                      Notification envoyée quand quelqu'un reçoit un nouveau message
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px' }}>🤝</span>
                  <div>
                    <strong style={{ color: '#ffcc00' }}>Recommandations</strong>
                    <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: '14px' }}>
                      Notification envoyée au talent et au recruteur lors d'une nouvelle recommandation
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px' }}>💼</span>
                  <div>
                    <strong style={{ color: '#ffcc00' }}>Offres d'emploi</strong>
                    <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: '14px' }}>
                      Notification envoyée à tous les talents quand une nouvelle offre est publiée
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting Guide */}
            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '24px',
              borderRadius: '8px'
            }}>
              <h3 style={{ color: '#f5f5f7', marginBottom: '16px' }}>🔧 Guide de dépannage</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }}>
                    ❌ Le test échoue ?
                  </h4>
                  <ul style={{ color: '#888', margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                    <li><strong>Vérifiez vos clés :</strong> Public Key, Service ID et Template ID corrects</li>
                    <li><strong>Template manquant :</strong> Créez au moins un template dans EmailJS</li>
                    <li><strong>Variables du template :</strong> Utilisez {'{'}to_email{'}'}, {'{'}to_name{'}'}, {'{'}subject{'}'}, {'{'}message{'}'}</li>
                    <li><strong>Domaine autorisé :</strong> Ajoutez localhost:5173 dans EmailJS Settings</li>
                    <li><strong>Quota dépassé :</strong> Vérifiez vos limites mensuelles EmailJS</li>
                  </ul>
                </div>
                
                <div>
                  <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }}>
                    🔑 Où trouver vos clés ?
                  </h4>
                  <ol style={{ color: '#888', margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                    <li>Allez sur <a href="https://dashboard.emailjs.com" target="_blank" style={{ color: '#ffcc00' }}>EmailJS Dashboard</a></li>
                    <li><strong>Public Key :</strong> Account {'>'} General</li>
                    <li><strong>Service ID :</strong> Email Services {'>'} votre service</li>
                    <li><strong>Template ID :</strong> Email Templates {'>'} votre template</li>
                  </ol>
                </div>
                
                <div>
                  <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }}>
                    📝 Variables de template recommandées
                  </h4>
                  <div style={{ 
                    backgroundColor: '#333', 
                    padding: '12px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontFamily: 'monospace',
                    color: '#f5f5f7'
                  }}>
                    {'{'}to_email{'}'}, {'{'}to_name{'}'}, {'{'}subject{'}'}, {'{'}message{'}'}<br/>
                    {'{'}coach_name{'}'}, {'{'}talent_name{'}'}, {'{'}recruiter_name{'}'}<br/>
                    {'{'}job_title{'}'}, {'{'}company_name{'}'}, {'{'}recommendation_message{'}'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'featured':
        return (
          <div>
            <h2 style={{ color: '#ffcc00', marginBottom: '24px' }}>Talents Mis en Avant</h2>
            <FeaturedTalentsManager />
          </div>
        );
        
      default:
        return <div>Section non trouvée</div>;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7'
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#ffcc00' }}>
            ProdTalent Admin
          </h1>
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
            Panneau d'administration
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#f5f5f7',
            border: '1px solid #333',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Se déconnecter
        </button>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <nav style={{
          width: '280px',
          backgroundColor: '#111',
          minHeight: 'calc(100vh - 73px)',
          padding: '24px'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', margin: 0 }}>
              Navigation
            </h3>
          </div>
          
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: activeSection === item.id ? '#ffcc00' : 'transparent',
                color: activeSection === item.id ? '#000' : '#f5f5f7',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '24px'
        }}>
          {renderContent()}
        </main>
      </div>

      {/* EmailJS Config Modal */}
      {isEmailJSConfigOpen && (
        <EmailJSConfig 
          onClose={() => setIsEmailJSConfigOpen(false)}
          onConfigSave={() => {
            // Refresh the configuration status
            const savedConfig = localStorage.getItem('emailjs_config');
            if (savedConfig) {
              try {
                const config = JSON.parse(savedConfig);
                const isConfigured = config.publicKey && config.serviceId;
                setEmailJSConfigured(isConfigured);
              } catch {
                setEmailJSConfigured(false);
              }
            } else {
              setEmailJSConfigured(false);
            }
            
            showNotification({
              type: 'success',
              title: 'Configuration mise à jour',
              message: 'La configuration EmailJS a été sauvegardée'
            });
          }} 
        />
      )}
    </div>
  );
}