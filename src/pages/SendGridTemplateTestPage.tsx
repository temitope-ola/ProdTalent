import React, { useState } from 'react';
import sendGridTemplateService from '../services/sendGridTemplateService';

export default function SendGridTemplateTestPage() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testTemplate = async (templateType: 'job' | 'application' | 'appointment_confirmation' | 'new_appointment' | 'message' | 'profile' | 'welcome', templateName: string) => {
    setIsLoading(true);
    setStatus(`🧪 Test du template "${templateName}"...`);

    try {
      const success = await sendGridTemplateService.testTemplate(templateType);
      
      if (success) {
        setStatus(`✅ Template "${templateName}" envoyé avec succès !`);
      } else {
        setStatus(`❌ Échec du test template "${templateName}"`);
      }
    } catch (error) {
      setStatus(`❌ Erreur test template: ${error}`);
    }

    setIsLoading(false);
  };

  const templates = [
    {
      id: 'job',
      title: '💼 Nouvelle offre d\'emploi',
      templateId: 'd-0cd03582b38a406da76f2b71e0481d9d',
      color: '#4CAF50',
      variables: [
        'talent_name: "John Doe"',
        'job_title: "Développeur Full-Stack"',
        'company_name: "TechCorp"',
        'job_location: "Paris, France"',
        'job_type: "CDI"'
      ]
    },
    {
      id: 'application',
      title: '📝 Nouvelle candidature reçue',
      templateId: 'd-6506536d39c1457fa6b5408c16d226dc',
      color: '#2196F3',
      variables: [
        'recruiter_name: "Marie Dupont"',
        'applicant_name: "Pierre Martin"',
        'job_title: "Développeur React"',
        'company_name: "InnoTech"',
        'application_date: Aujourd\'hui'
      ]
    },
    {
      id: 'appointment_confirmation',
      title: '📅 Confirmation de rendez-vous',
      templateId: 'd-488f0d2aab2845369229ad2319fc868f',
      color: '#FF9800',
      variables: [
        'talent_name: "Alice Johnson"',
        'coach_name: "Coach Sarah"',
        'appointment_date: "15 septembre 2025"',
        'appointment_time: "14:30"',
        'meeting_type: "Session de coaching"'
      ]
    },
    {
      id: 'new_appointment',
      title: '🆕 Nouveau rendez-vous',
      templateId: 'd-ac4aade4451646df9fd0e9f24a1eb054',
      color: '#9C27B0',
      variables: [
        'talent_name: "Bob Wilson"',
        'coach_name: "Coach Emma"',
        'appointment_date: "20 septembre 2025"',
        'appointment_time: "16:00"',
        'meeting_type: "Préparation entretien"'
      ]
    },
    {
      id: 'message',
      title: '💬 Nouveau message',
      templateId: 'd-ce52fb56dcdd4ebf8977553881e1f80c',
      color: '#00BCD4',
      variables: [
        'recipient_name: "Charlie Brown"',
        'sender_name: "Entreprise TechStart"',
        'sender_role: "Recruteur"',
        'message_preview: "Votre profil nous intéresse..."'
      ]
    },
    {
      id: 'profile',
      title: '👤 Nouveau profil disponible',
      templateId: 'd-f5f8e405aa0a409aace81ae661488b50',
      color: '#795548',
      variables: [
        'recruiter_name: "Diana Prince"',
        'talent_name: "Alex Martin"',
        'talent_skills: "React, Node.js, TypeScript"',
        'talent_experience: "5 ans full-stack"'
      ]
    },
    {
      id: 'welcome',
      title: '🎉 Bienvenue sur ProdTalent',
      templateId: 'd-fa1de9a468f448a9a34f393134468b1e',
      color: '#E91E63',
      variables: [
        'user_name: "Emma Thompson"',
        'user_role: "Talent"',
        'dashboard_url: "/dashboard/talent"',
        'Contenu adaptatif selon le rôle'
      ]
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#ffcc00', textAlign: 'center', marginBottom: '8px' }}>
          🧪 Test Templates SendGrid Complets
        </h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '32px' }}>
          Test de vos 7 templates SendGrid dynamiques avec données réelles
        </p>

        {/* Templates grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {templates.map((template, index) => (
            <div key={template.id} style={{
              backgroundColor: '#111',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <h3 style={{ color: '#ffcc00', margin: '0 0 12px 0', fontSize: '18px' }}>
                {template.title}
              </h3>
              <p style={{ color: '#ccc', fontSize: '12px', marginBottom: '16px' }}>
                Template ID: {template.templateId}
              </p>
              
              <div style={{ marginBottom: '20px', fontSize: '13px' }}>
                <strong style={{ color: template.color }}>Variables testées :</strong>
                <ul style={{ 
                  marginTop: '8px', 
                  paddingLeft: '16px', 
                  color: '#888',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  {template.variables.map((variable, i) => (
                    <li key={i} style={{ margin: '2px 0' }}>{variable}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => testTemplate(template.id as any, template.title)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: isLoading ? '#444' : template.color,
                  color: '#fff',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                {isLoading ? '⏳ Test en cours...' : 'Tester ce template'}
              </button>
            </div>
          ))}
        </div>

        {/* Status */}
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #444',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#ffcc00', margin: '0 0 16px 0' }}>
            📊 Status des tests
          </h3>
          <div style={{
            backgroundColor: '#000',
            padding: '16px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            minHeight: '60px',
            whiteSpace: 'pre-wrap',
            border: '1px solid #333'
          }}>
            {status || 'Prêt pour les tests... Cliquez sur un bouton de test ci-dessus.'}
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            📋 Instructions
          </h2>
          <ol style={{ paddingLeft: '20px', lineHeight: 1.6, marginBottom: '20px' }}>
            <li>Assurez-vous que le serveur backend fonctionne (port 3000)</li>
            <li>Vérifiez que votre clé API SendGrid est configurée</li>
            <li>Cliquez sur "🧪 Tester ce template" pour tester un template</li>
            <li>Consultez votre boîte mail <strong>admin@prodtalent.com</strong> pour voir le résultat</li>
            <li>Les variables sont automatiquement remplies avec des données de test réalistes</li>
            <li>Chaque test utilise des données différentes pour voir la variété</li>
          </ol>

          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#1a4d3a', 
            borderRadius: '5px',
            border: '1px solid #4CAF50'
          }}>
            <strong style={{ color: '#4CAF50' }}>✅ Système complet (6/6 templates) :</strong>
            <ul style={{ marginTop: '10px', paddingLeft: '20px', fontSize: '13px' }}>
              <li>🎯 <strong>Engagement utilisateur</strong> - Notifications instantanées</li>
              <li>🎨 <strong>Design professionnel</strong> - Templates SendGrid responsives</li>
              <li>⚡ <strong>Variables dynamiques</strong> - Personnalisation automatique</li>
              <li>📊 <strong>Analytics</strong> - Statistiques d'ouverture et de clic</li>
              <li>🔧 <strong>Maintenance facile</strong> - Modification depuis SendGrid</li>
              <li>🚀 <strong>Délivrabilité 99.9%</strong> - Infrastructure professionnelle</li>
            </ul>
          </div>

          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            backgroundColor: '#2c1810', 
            borderRadius: '5px',
            border: '1px solid #FF9800'
          }}>
            <strong style={{ color: '#FF9800' }}>🚀 Prochaines étapes :</strong>
            <ul style={{ marginTop: '10px', paddingLeft: '20px', fontSize: '13px' }}>
              <li>Intégrer ces templates dans la messagerie ProdTalent</li>
              <li>Connecter aux notifications de candidatures</li>
              <li>Automatiser les confirmations de rendez-vous</li>
              <li>Activer les notifications de nouveaux profils</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}