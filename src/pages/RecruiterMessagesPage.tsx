import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';

interface Message {
  id: string;
  from: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  subject: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const RecruiterMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientRole, setRecipientRole] = useState<'talent' | 'coach'>('talent');
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const messagesData = await FirestoreService.getUserMessages(user.id);
      setMessages(messagesData);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les messages'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim() || !recipientEmail.trim()) {
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs'
      });
      return;
    }

    try {
      // Récupérer l'ID du destinataire par son email
      const recipientProfile = await FirestoreService.getProfileById(recipientEmail);
      if (!recipientProfile) {
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Destinataire non trouvé'
        });
        return;
      }

      const success = await FirestoreService.sendMessage(
        user.id,
        recipientProfile.id,
        `Message de ${user.displayName || user.email?.split('@')[0] || 'Recruteur'}`,
        newMessage.trim(),
        {
          id: user.id,
          email: user.email || '',
          role: user.role,
          displayName: user.displayName || user.email?.split('@')[0] || 'Recruteur'
        } as any
      );

      if (success) {
        setNewMessage('');
        setRecipientEmail('');
        setIsComposing(false);
        await loadMessages();

        showNotification({
          type: 'success',
          title: 'Succès',
          message: 'Message envoyé avec succès'
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible d\'envoyer le message'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'envoyer le message'
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await FirestoreService.markMessageAsRead(messageId);
      await loadMessages();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getUnreadCount = () => {
    return messages.filter(msg => !msg.read).length;
  };



  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#f5f5f7',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div>Chargement des messages...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #333'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/dashboard/recruteur')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#f5f5f7',
                border: '0.5px solid #f5f5f7',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Retour
            </button>
            <div>
              <h1 style={{ color: '#ffcc00', margin: 0 }}>Messages</h1>
              <p style={{ margin: '8px 0 0 0', color: '#999' }}>
                {getUnreadCount()} message{getUnreadCount() > 1 ? 's' : ''} non lu{getUnreadCount() > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsComposing(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Nouveau message
          </button>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '24px',
          height: 'calc(100vh - 200px)'
        }}>
          {/* Liste des messages */}
          <div style={{
            backgroundColor: '#111',
            borderRadius: '4px',
            padding: '16px',
            overflowY: 'auto'
          }}>
            <h3 style={{ color: '#ffcc00', marginTop: 0, marginBottom: '16px' }}>Conversations</h3>
            {messages.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center' }}>Aucun message</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.read) {
                        markAsRead(message.id);
                      }
                    }}
                    style={{
                      padding: '12px',
                      backgroundColor: message.read ? 'transparent' : '#333',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: message.read ? '#f5f5f7' : '#ffcc00' }}>
                        {message.from.name}
                      </strong>
                      {!message.read && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#ffcc00',
                          borderRadius: '50%'
                        }} />
                      )}
                    </div>
                    <p style={{
                      color: '#999',
                      fontSize: '14px',
                      margin: '4px 0 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {message.message}
                    </p>
                    <small style={{ color: '#666', fontSize: '12px' }}>
                      {formatDate(message.timestamp)}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Détail du message ou composition */}
          <div style={{
            backgroundColor: '#111',
            borderRadius: '4px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {isComposing ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: '#ffcc00', marginTop: 0, marginBottom: '16px' }}>Nouveau message</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Destinataire (email)
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px'
                    }}
                    placeholder="email@exemple.com"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Type de destinataire
                  </label>
                  <select
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value as 'talent' | 'coach')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="talent">Talent</option>
                    <option value="coach">Coach</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px', flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Message
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{
                      width: '100%',
                      height: '200px',
                      padding: '8px 12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      resize: 'vertical'
                    }}
                    placeholder="Votre message..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={sendMessage}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#ffcc00',
                      color: '#000',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Envoyer
                  </button>
                  <button
                    onClick={() => {
                      setIsComposing(false);
                      setNewMessage('');
                      setRecipientEmail('');
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'transparent',
                      color: '#f5f5f7',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : selectedMessage ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ color: '#ffcc00', marginTop: 0, marginBottom: '8px' }}>
                    {selectedMessage.from.name}
                  </h3>
                  <p style={{ color: '#999', margin: 0 }}>
                    {formatDate(selectedMessage.timestamp)}
                  </p>
                </div>
                
                <div style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: '#333',
                  borderRadius: '4px',
                  marginBottom: '16px'
                }}>
                  <p style={{ margin: 0, lineHeight: '1.6' }}>{selectedMessage.message}</p>
                </div>

                <button
                  onClick={() => setIsComposing(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ffcc00',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    alignSelf: 'flex-start'
                  }}
                >
                  Répondre
                </button>
              </div>
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999'
              }}>
                <p>Sélectionnez un message pour le lire</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterMessagesPage;
