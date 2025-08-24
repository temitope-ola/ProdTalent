import React, { useEffect, useState } from 'react';

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Attendre l'animation de sortie
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          background: 'rgba(97, 191, 172, 0.1)',
          border: '#61bfac',
          icon: '#61bfac'
        };
      case 'error':
        return {
          background: 'rgba(255, 107, 107, 0.1)',
          border: '#ff6b6b',
          icon: '#ff6b6b'
        };
      case 'warning':
        return {
          background: 'rgba(255, 204, 0, 0.1)',
          border: '#ffcc00',
          icon: '#ffcc00'
        };
      case 'info':
        return {
          background: 'rgba(97, 191, 172, 0.1)',
          border: '#61bfac',
          icon: '#61bfac'
        };
      default:
        return {
          background: 'rgba(245, 245, 247, 0.1)',
          border: '#f5f5f7',
          icon: '#f5f5f7'
        };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        minWidth: '300px',
        maxWidth: '400px',
        backgroundColor: '#111',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        backdropFilter: 'blur(10px)',
        borderLeft: `4px solid ${colors.border}`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ fontSize: '20px', color: colors.icon, flexShrink: 0 }}>
          {getIcon()}
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{
            color: '#f5f5f7',
            margin: '0 0 4px 0',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {title}
          </h4>
          <p style={{
            color: '#888',
            margin: 0,
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            {message}
          </p>
        </div>
        
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
            e.currentTarget.style.color = '#f5f5f7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#666';
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
