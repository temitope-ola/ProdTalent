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

const CoachMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        // Charger les vrais messages depuis Firestore
        const realMessages = await FirestoreService.getUserMessages(user.id);
        
        // Convertir le format des messages
        const formattedMessages: Message[] = realMessages.map((msg: any) => ({
          id: msg.id,
          from: msg.from,
          subject: msg.subject,
          message: msg.message,
          timestamp: msg.timestamp,
          read: msg.read
        }));
        
        setMessages(formattedMessages);
        
        // Regrouper les messages en conversations avec profils complets
        const conversationsData = await FirestoreService.groupMessagesByConversationWithProfiles(realMessages, user.id);
        setConversations(conversationsData);
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await FirestoreService.signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    // Marquer comme lu dans Firestore
    if (!message.read) {
      await FirestoreService.markMessageAsRead(message.id);
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, read: true } : msg
      ));
    }
  };

  const handleConversationClick = async (conversation: any) => {
    setSelectedConversation(conversation);
    setSelectedMessage(null);
    // Marquer les messages non lus comme lus
    const unreadMessages = conversation.messages.filter((msg: any) => msg.type === 'received' && !msg.read);
    for (const msg of unreadMessages) {
      await FirestoreService.markMessageAsRead(msg.id);
    }
    // Recharger les conversations
    const realMessages = await FirestoreService.getUserMessages(user.id);
    const conversationsData = await FirestoreService.groupMessagesByConversationWithProfiles(realMessages, user.id);
    setConversations(conversationsData);
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setIsReplyModalOpen(true);
    setReplyContent('');
  };

  const handleSendReply = async () => {
    if (!replyingTo || !replyContent.trim() || !user) return;

    try {
      // Envoyer la réponse via FirestoreService
      const success = await FirestoreService.sendMessage(
        user.id,
        replyingTo.from.id,
        `Réponse: ${replyingTo.subject}`,
        replyContent,
        {
          id: user.id,
          email: user.email || '',
          role: user.role,
          displayName: user.displayName || user.email?.split('@')[0] || 'Coach'
        } as any
      );

      if (success) {
        showNotification({
          type: 'success',
          title: 'Réponse envoyée',
          message: 'Votre réponse a été envoyée avec succès'
        });
        setIsReplyModalOpen(false);
        setReplyContent('');
        setReplyingTo(null);
        
        // Recharger les messages pour afficher la réponse
        const realMessages = await FirestoreService.getUserMessages(user.id);
        const formattedMessages: Message[] = realMessages.map((msg: any) => ({
          id: msg.id,
          from: msg.from,
          subject: msg.subject,
          message: msg.message,
          timestamp: msg.timestamp,
          read: msg.read
        }));
        setMessages(formattedMessages);
        
        // Regrouper les messages en conversations avec profils complets
        const conversationsData = await FirestoreService.groupMessagesByConversationWithProfiles(realMessages, user.id);
        setConversations(conversationsData);
      } else {
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible d\'envoyer la réponse'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue lors de l\'envoi'
      });
    }
  };

  const unreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000', 
        color: '#f5f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Chargement des messages...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      color: '#f5f5f7',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '1214px',
        maxWidth: '100%',
        padding: '24px'
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 16,
          borderBottom: '1px solid #333',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate('/dashboard/coach')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#ffcc00',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              Retour
            </button>
            <h1 style={{ margin: 0, color: '#ffcc00' }}>
              Mes Messages {unreadCount > 0 && `(${unreadCount} non lus)`}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#333',
              color: '#f5f5f7',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Se déconnecter
          </button>
        </header>

        <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 140px)' }}>
          {/* Liste des messages */}
          <div style={{ 
            width: '400px', 
            backgroundColor: '#111', 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: 16,
              borderBottom: '1px solid #333',
              backgroundColor: '#0a0a0a'
            }}>
              <h2 style={{ margin: 0, color: '#ffcc00', fontSize: '18px' }}>
                Boîte de réception
              </h2>
            </div>
            
            <div style={{ 
              height: 'calc(100% - 60px)', 
              overflowY: 'auto'
            }}>
              {conversations.length === 0 ? (
                <div style={{
                  padding: 20,
                  textAlign: 'center',
                  color: '#888'
                }}>
                  Aucune conversation
                </div>
              ) : (
                conversations.map((conversation, index) => (
                  <div
                    key={`${conversation.interlocutor.id}-${index}`}
                    onClick={() => handleConversationClick(conversation)}
                    style={{
                      padding: 16,
                      borderBottom: '1px solid #333',
                      cursor: 'pointer',
                      backgroundColor: selectedConversation?.interlocutor.id === conversation.interlocutor.id ? '#222' : 'transparent',
                      borderLeft: selectedConversation?.interlocutor.id === conversation.interlocutor.id ? '3px solid #ffcc00' : '3px solid transparent'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8
                    }}>
                      <h3 style={{ 
                        color: conversation.unreadCount > 0 ? '#f5f5f7' : '#888', 
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal'
                      }}>
                        {conversation.interlocutor.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {conversation.unreadCount > 0 && (
                          <span style={{ color: '#ffcc00', fontSize: '12px', fontWeight: 'bold' }}>
                            ({conversation.unreadCount})
                          </span>
                        )}
                        <span style={{ color: '#888', fontSize: '12px' }}>
                          {conversation.lastMessage.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p style={{ 
                      color: '#888', 
                      margin: '0 0 8px 0',
                      fontSize: '14px'
                    }}>
                      {conversation.interlocutor.role}: {conversation.interlocutor.email}
                    </p>
                    <p style={{ 
                      color: '#888', 
                      margin: 0,
                      fontSize: '14px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {conversation.lastMessage.type === 'sent' && 'Vous: '}{conversation.lastMessage.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Détail de la conversation */}
          {selectedConversation && (
            <div style={{ 
              flex: 1, 
              backgroundColor: '#111', 
              borderRadius: 4,
              padding: 20
            }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: '#ffcc00', margin: '0 0 16px 0' }}>
                  Conversation avec {selectedConversation.interlocutor.name}
                </h2>
                
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: '#888', margin: '0 0 4px 0' }}>
                    <strong>Email:</strong> {selectedConversation.interlocutor.email}
                  </p>
                  <p style={{ color: '#888', margin: '0 0 8px 0' }}>
                    <strong>Rôle:</strong> {selectedConversation.interlocutor.role}
                  </p>
                  <p style={{ color: '#888', margin: 0 }}>
                    <strong>Messages:</strong> {selectedConversation.messages.length}
                  </p>
                </div>
              </div>

              <div style={{ 
                flex: 1,
                overflowY: 'auto',
                marginBottom: 20,
                padding: '8px'
              }}>
                {selectedConversation.messages
                  .sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime())
                  .map((msg: any) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: '12px',
                      padding: '12px',
                      backgroundColor: msg.type === 'sent' ? '#1a4d3a' : '#333',
                      borderRadius: '4px',
                      borderLeft: msg.type === 'sent' ? '3px solid #4caf50' : '3px solid #ffcc00'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '8px',
                      fontSize: '12px',
                      color: '#999'
                    }}>
                      <span>{msg.type === 'sent' ? 'Vous' : msg.from.name}</span>
                      <span>{msg.timestamp.toLocaleString()}</span>
                    </div>
                    <p style={{ margin: 0, lineHeight: '1.6', color: '#f5f5f7' }}>
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => handleReply(selectedConversation.lastMessage)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ffcc00',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Répondre
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de réponse */}
        {isReplyModalOpen && replyingTo && (
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
              width: '500px',
              maxWidth: '90%',
              maxHeight: '80%',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <h3 style={{ color: '#ffcc00', margin: 0 }}>
                  Répondre à {replyingTo.from.name}
                </h3>
                <button
                  onClick={() => {
                    setIsReplyModalOpen(false);
                    setReplyContent('');
                    setReplyingTo(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{
                  backgroundColor: '#222',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}>
                  <p style={{ color: '#f5f5f7', margin: '0 0 4px 0', fontWeight: 'bold' }}>
                    <strong>À:</strong> {replyingTo.from.name}
                  </p>
                  <p style={{ color: '#ffcc00', margin: '0 0 4px 0' }}>
                    📧 {replyingTo.from.email}
                  </p>
                  <p style={{ color: '#888', margin: 0, fontSize: '12px' }}>
                    {replyingTo.from.role}
                  </p>
                </div>
                <p style={{ color: '#888', margin: '0 0 16px 0' }}>
                  <strong>Sujet:</strong> Réponse: {replyingTo.subject}
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ 
                  display: 'block', 
                  color: '#f5f5f7', 
                  marginBottom: 8,
                  fontWeight: 'bold'
                }}>
                  Votre réponse:
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: 12,
                    backgroundColor: '#222',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: 4,
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Tapez votre réponse ici..."
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setIsReplyModalOpen(false);
                    setReplyContent('');
                    setReplyingTo(null);
                  }}
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
                  onClick={handleSendReply}
                  disabled={!replyContent.trim()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: replyContent.trim() ? '#ffcc00' : '#333',
                    color: replyContent.trim() ? '#000' : '#888',
                    border: 'none',
                    borderRadius: 4,
                    cursor: replyContent.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold'
                  }}
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachMessagesPage;
