import React, { useState } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from './NotificationManager';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  talentName: string;
  talentEmail: string;
  talentId: string;
  fromUserProfile: any;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, talentName, talentEmail, talentId, fromUserProfile }) => {
  const { showNotification } = useNotifications();
  const [contactMethod, setContactMethod] = useState<'message'>('message');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Envoyer le message via Firestore
      const success = await FirestoreService.sendMessage(
        fromUserProfile.id,
        talentId,
        subject,
        message,
        fromUserProfile
      );

      if (success) {
        showNotification({
          type: 'success',
          title: 'Message envoyé',
          message: `Votre message a été envoyé avec succès à ${talentName}`
        });
        onClose();
      } else {
        showNotification({
          type: 'error',
          title: 'Erreur d\'envoi',
          message: 'Erreur lors de l\'envoi du message'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors de l\'envoi du message'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailContact = () => {
    const mailtoLink = `mailto:${talentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(mailtoLink, '_blank');
  };



  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#111',
        borderRadius: 4,
        padding: 24,
        maxWidth: 500,
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: 'none'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <h2 style={{ color: '#ffcc00', margin: 0 }}>Contacter {talentName}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: 24,
              cursor: 'pointer',
              padding: 0
            }}
          >
            ×
          </button>
        </div>

        {/* Méthode de contact */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: '#f5f5f7', marginBottom: 12 }}>Contact</h3>
          <p style={{ color: '#888', margin: 0 }}>
            Votre message sera envoyé via l'application et une notification email sera transmise au talent.
          </p>
        </div>

        {/* Formulaire de contact */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              color: '#f5f5f7',
              marginBottom: 8,
              fontWeight: 'bold'
            }}>
              Sujet
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Opportunité de poste développeur React"
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: '#222',
                border: 'none',
                borderRadius: 4,
                color: '#f5f5f7',
                fontSize: 14
              }}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              color: '#f5f5f7',
              marginBottom: 8,
              fontWeight: 'bold'
            }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bonjour, je suis intéressé par votre profil..."
              rows={6}
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: '#222',
                border: 'none',
                borderRadius: 4,
                color: '#f5f5f7',
                fontSize: 14,
                resize: 'vertical'
              }}
              required
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#888',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
            

            

            
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ffcc00',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer le message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
