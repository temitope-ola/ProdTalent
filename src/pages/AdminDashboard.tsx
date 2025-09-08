import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeaturedTalentsManager from '../components/FeaturedTalentsManager';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('featured');

  const menuItems = [
    { id: 'featured', label: 'Talents Mis en Avant', icon: '⭐' },
    { id: 'sendgrid', label: 'SendGrid Templates', icon: '📮' },
    { id: 'google', label: 'Google Config', icon: '🔗' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'featured':
        return (
          <div>
            <h2 style={{ color: '#ffcc00', marginBottom: '24px' }}>Talents Mis en Avant</h2>
            <FeaturedTalentsManager />
          </div>
        );
      
      case 'sendgrid':
        return (
          <div>
            <h2 style={{ color: '#ffcc00', marginBottom: '24px' }}>Tests SendGrid</h2>
            <button 
              onClick={() => navigate('/sendgrid-test')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ffcc00',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Accéder aux tests SendGrid
            </button>
          </div>
        );

      case 'google':
        return (
          <div>
            <h2 style={{ color: '#ffcc00', marginBottom: '24px' }}>Configuration Google</h2>
            <button 
              onClick={() => navigate('/google-config')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#61bfac',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Configurer Google Services
            </button>
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
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#ffcc00', margin: 0 }}>Admin Dashboard</h1>
        <button
          onClick={() => navigate('/dashboard/admin')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#333',
            color: '#f5f5f7',
            border: '1px solid #555',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retour
        </button>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar */}
        <div style={{
          width: '300px',
          backgroundColor: '#1a1a1a',
          padding: '24px',
          borderRight: '1px solid #333'
        }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                padding: '16px',
                marginBottom: '8px',
                backgroundColor: activeSection === item.id ? '#333' : 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                border: activeSection === item.id ? '1px solid #ffcc00' : '1px solid transparent'
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '24px'
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}