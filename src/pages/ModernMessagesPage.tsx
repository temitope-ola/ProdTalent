import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationManager';
import Avatar from '../components/Avatar';

interface User {
  id: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  fromUser: User;
  toUser: User;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  contactId: string;
  contact: User;
  lastMessage?: Message;
  unreadCount: number;
  messages: Message[];
}

export default function ModernMessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotifications();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('💬 MESSAGERIE MODERNE - User:', user?.id, user?.email);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Gestion du coach présélectionné depuis la navigation
  useEffect(() => {
    const selectedCoach = location.state?.selectedContact;
    if (selectedCoach && conversations.length > 0) {
      // Chercher s'il y a déjà une conversation avec ce coach
      const existingConv = conversations.find(conv => conv.contactId === selectedCoach.id);
      if (existingConv) {
        setSelectedConversation(selectedCoach.id);
        markConversationAsRead(selectedCoach.id);
      } else {
        // Créer une nouvelle conversation
        createNewConversationWithCoach(selectedCoach);
      }
    }
  }, [conversations, location.state]);

  useEffect(() => {
    // Scroll vers le bas quand de nouveaux messages arrivent
    scrollToBottom();
  }, [selectedConversation, conversations]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('📱 Chargement des conversations...');

      const { FirestoreService } = await import('../services/firestoreService');
      const messages = await FirestoreService.getUserMessages(user.id);
      
      console.log('📱 Messages bruts:', messages.length);

      // Grouper les messages par conversation
      const conversationMap = new Map<string, Conversation>();

      for (const message of messages) {
        let contactId: string;
        let contact: any;
        let isFromMe: boolean;

        if (message.type === 'received') {
          // Message reçu : contact = expéditeur
          isFromMe = false;
          contactId = message.from.id;
          contact = {
            id: message.from.id,
            displayName: message.from.name,
            email: message.from.email,
            role: message.from.role,
            avatarUrl: message.from.avatarUrl
          };
        } else {
          // Message envoyé : contact = destinataire
          isFromMe = true;
          contactId = message.to;
          // Pour les messages envoyés, essayons de trouver les infos du destinataire
          const receivedMsg = messages.find(m => m.type === 'received' && m.from.id === message.to);
          if (receivedMsg) {
            contact = {
              id: receivedMsg.from.id,
              displayName: receivedMsg.from.name,
              email: receivedMsg.from.email,
              role: receivedMsg.from.role,
              avatarUrl: receivedMsg.from.avatarUrl
            };
          } else {
            contact = {
              id: message.to,
              displayName: 'Destinataire',
              email: '',
              role: 'unknown',
              avatarUrl: ''
            };
          }
        }

        if (!conversationMap.has(contactId)) {
          conversationMap.set(contactId, {
            contactId,
            contact,
            messages: [],
            unreadCount: 0,
            lastMessage: undefined
          });
        }

        const conversation = conversationMap.get(contactId)!;
        
        // Convertir le message au format attendu par l'interface
        const formattedMessage = {
          id: message.id,
          from: isFromMe ? user.id : contactId,
          to: isFromMe ? contactId : user.id,
          fromUser: isFromMe ? { id: user.id, email: user.email, role: user.role } : contact,
          toUser: isFromMe ? contact : { id: user.id, email: user.email, role: user.role },
          content: message.message,
          timestamp: message.timestamp,
          read: message.read
        };
        
        conversation.messages.push(formattedMessage);
        
        // Mettre à jour le dernier message
        if (!conversation.lastMessage || message.timestamp > conversation.lastMessage.timestamp) {
          conversation.lastMessage = formattedMessage;
        }

        // Compter les messages non lus (reçus et non lus)
        if (!isFromMe && !message.read) {
          conversation.unreadCount++;
        }
      }

      // Trier les messages de chaque conversation par date
      conversationMap.forEach(conversation => {
        conversation.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });

      // Convertir en tableau et trier par dernier message
      const conversationsArray = Array.from(conversationMap.values())
        .sort((a, b) => {
          const aTime = a.lastMessage?.timestamp.getTime() || 0;
          const bTime = b.lastMessage?.timestamp.getTime() || 0;
          return bTime - aTime;
        });

      console.log('📱 Conversations créées:', conversationsArray.length);
      setConversations(conversationsArray);

    } catch (error) {
      console.error('❌ Erreur chargement conversations:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les conversations'
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewConversationWithCoach = async (coach: User) => {
    if (!user) return;

    try {
      // Créer une nouvelle conversation vide avec le coach
      const newConversation: Conversation = {
        contactId: coach.id,
        contact: coach,
        unreadCount: 0,
        messages: []
      };

      // Ajouter la conversation à la liste
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(coach.id);

      console.log('✅ Nouvelle conversation créée avec:', coach.displayName);
    } catch (error) {
      console.error('❌ Erreur création conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    try {
      console.log('📤 Envoi message à:', selectedConversation);

      const { FirestoreService } = await import('../services/firestoreService');
      const currentProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
      await FirestoreService.sendMessage(user.id, selectedConversation, 'Message', newMessage.trim(), currentProfile);

      // Récupérer les infos du destinataire pour Gmail API
      const recipientProfile = await FirestoreService.getCurrentProfile(selectedConversation, 'talent'); // Try talent first
      const recipientProfileRecruiter = !recipientProfile ? await FirestoreService.getCurrentProfile(selectedConversation, 'recruteur') : null;
      const recipientProfileCoach = !recipientProfile && !recipientProfileRecruiter ? await FirestoreService.getCurrentProfile(selectedConversation, 'coach') : null;
      
      const finalRecipient = recipientProfile || recipientProfileRecruiter || recipientProfileCoach;

      if (finalRecipient && finalRecipient.email) {
        // Envoyer notification via Firebase Functions (votre email admin)
        try {
          const { BackendEmailService } = await import('../services/backendEmailService');
          
          const recipientName = finalRecipient.displayName || finalRecipient.firstName || 'Utilisateur';
          const senderName = currentProfile.displayName || currentProfile.firstName || user.email.split('@')[0];
          const senderRole = currentProfile.role === 'talent' ? 'Talent' : currentProfile.role === 'recruteur' ? 'Recruteur' : 'Coach';
          const recipientRole = finalRecipient.role === 'talent' ? 'Talent' : finalRecipient.role === 'recruteur' ? 'Recruteur' : 'Coach';
          const messagePreview = newMessage.trim().substring(0, 100) + (newMessage.trim().length > 100 ? '...' : '');

          // Envoyer notification au destinataire
          const emailSent = await BackendEmailService.sendMessageNotification({
            recipientEmail: finalRecipient.email,
            recipientName: recipientName,
            senderName: senderName,
            senderRole: senderRole,
            messagePreview: messagePreview
          });

          // Envoyer confirmation à l'expéditeur
          if (user.email) {
            await BackendEmailService.sendMessageConfirmationToSender({
              senderEmail: user.email,
              senderName: senderName,
              recipientName: recipientName,
              recipientRole: recipientRole,
              messagePreview: newMessage.trim(),
              subject: messageSubject
            });
          }
          
          console.log(emailSent ? '✅ Notification envoyée au destinataire et confirmation à l\'expéditeur' : '❌ Échec notification message');
        } catch (emailError) {
          console.error('❌ Erreur envoi notification message:', emailError);
        }
      }

      setNewMessage('');
      
      // Recharger les conversations pour voir le nouveau message
      await loadConversations();

      showNotification({
        type: 'success',
        title: 'Message envoyé',
        message: 'Votre message a été envoyé avec succès'
      });

    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'envoyer le message'
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getContactName = (contact: User | null | undefined) => {
    if (!contact) return 'Utilisateur inconnu';
    if (contact.displayName) return contact.displayName;
    if (contact.firstName && contact.lastName) return `${contact.firstName} ${contact.lastName}`;
    return contact.email?.split('@')[0] || 'Utilisateur inconnu';
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getCurrentConversation = () => {
    return conversations.find(c => c.contactId === selectedConversation);
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!user) return;
    
    try {
      const { FirestoreService } = await import('../services/firestoreService');
      
      // Trouver la conversation
      const conversation = conversations.find(c => c.contactId === conversationId);
      if (!conversation) return;
      
      // Marquer tous les messages non lus de cette conversation comme lus
      const unreadMessages = conversation.messages.filter(msg => 
        msg.to === user.id && !msg.read
      );
      
      console.log('📖 Marquage de', unreadMessages.length, 'messages comme lus pour conversation:', conversationId);
      
      for (const message of unreadMessages) {
        await FirestoreService.markMessageAsRead(message.id);
      }
      
      // Mettre à jour l'état local
      setConversations(prev => prev.map(conv => {
        if (conv.contactId === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.to === user.id && !msg.read ? { ...msg, read: true } : msg
            ),
            unreadCount: 0
          };
        }
        return conv;
      }));
      
    } catch (error) {
      console.error('❌ Erreur marquage messages comme lus:', error);
    }
  };

  if (!user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
    }}>
      {/* Colonne de gauche - Liste des conversations */}
      <div style={{
        width: window.innerWidth <= 768 ? '100%' : '350px',
        minWidth: window.innerWidth <= 768 ? 'auto' : '300px',
        maxWidth: window.innerWidth <= 768 ? '100%' : '400px',
        backgroundColor: '#1a1a1a',
        borderRight: window.innerWidth <= 768 ? 'none' : '1px solid #333',
        borderBottom: window.innerWidth <= 768 ? '1px solid #333' : 'none',
        display: 'flex',
        flexDirection: 'column',
        height: window.innerWidth <= 768 ? (selectedConversation ? '0px' : '50vh') : '100vh',
        overflow: 'hidden',
        transition: 'height 0.3s ease'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
          backgroundColor: '#111'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{ color: '#ffcc00', margin: 0, fontSize: '20px' }}>💬 Messages</h2>
            <button
              onClick={() => {
                // Si l'utilisateur vient de la page des profils coaches, retourner là-bas
                if (location.state?.selectedContact) {
                  navigate('/talent/coaches');
                } else {
                  navigate(-1);
                }
              }}
              style={{
                background: 'transparent',
                border: '1px solid #ffcc00',
                color: '#ffcc00',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ← Retour
            </button>
          </div>
          <div style={{ color: '#888', fontSize: '14px' }}>
            {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Liste des conversations */}
        <div style={{
          flex: 1,
          overflowY: 'auto'
        }}>
          {loading ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#888'
            }}>
              ⏳ Chargement des conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#888'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <div>Aucune conversation</div>
              <div style={{ fontSize: '12px', marginTop: '8px' }}>
                Vos messages apparaîtront ici
              </div>
            </div>
          ) : (
            conversations.map(conversation => {
              // Skip conversations without contact
              if (!conversation.contact) {
                console.warn('⚠️ Conversation sans contact:', conversation.contactId);
                return null;
              }
              
              return (
                <div
                  key={conversation.contactId}
                  onClick={() => {
                    setSelectedConversation(conversation.contactId);
                    markConversationAsRead(conversation.contactId);
                  }}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #333',
                    cursor: 'pointer',
                    backgroundColor: selectedConversation === conversation.contactId ? '#333' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedConversation !== conversation.contactId) {
                      e.currentTarget.style.backgroundColor = '#222';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedConversation !== conversation.contactId) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Avatar
                      src={conversation.contact?.avatarUrl}
                      alt={getContactName(conversation.contact)}
                      size="medium"
                    />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <div style={{
                        color: '#f5f5f7',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {getContactName(conversation.contact)}
                      </div>
                      {conversation.lastMessage && (
                        <div style={{
                          color: '#888',
                          fontSize: '12px'
                        }}>
                          {formatTime(conversation.lastMessage.timestamp)}
                        </div>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        color: '#888',
                        fontSize: '13px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}>
                        {conversation.lastMessage ? conversation.lastMessage.content : 'Aucun message'}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div style={{
                          backgroundColor: '#ffcc00',
                          color: '#000',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          marginLeft: '8px'
                        }}>
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>

      {/* Colonne de droite - Chat */}
      <div style={{
        flex: 1,
        display: window.innerWidth <= 768 && !selectedConversation ? 'none' : 'flex',
        flexDirection: 'column',
        backgroundColor: '#111',
        height: window.innerWidth <= 768 ? '50vh' : '100vh',
        minHeight: window.innerWidth <= 768 ? '400px' : 'auto'
      }}>
        {selectedConversation ? (
          <>
            {/* Header du chat */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #333',
              backgroundColor: '#1a1a1a'
            }}>
              {(() => {
                const conversation = getCurrentConversation();
                if (!conversation || !conversation.contact) return null;
                
                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {/* Bouton retour pour mobile */}
                    {window.innerWidth <= 768 && (
                      <button
                        onClick={() => setSelectedConversation(null)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #ffcc00',
                          color: '#ffcc00',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          marginRight: '8px'
                        }}
                      >
                        ←
                      </button>
                    )}
                    <Avatar
                      src={conversation.contact?.avatarUrl}
                      alt={getContactName(conversation.contact)}
                      size="medium"
                    />
                    <div>
                      <div style={{
                        color: '#f5f5f7',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {getContactName(conversation.contact)}
                      </div>
                      <div style={{
                        color: '#888',
                        fontSize: '12px'
                      }}>
                        {conversation.contact.role} • {conversation.contact.email}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Zone des messages */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {(() => {
                const conversation = getCurrentConversation();
                if (!conversation || conversation.messages.length === 0) {
                  return (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      color: '#888',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      <div style={{ fontSize: '48px' }}>💬</div>
                      <div>Commencez une conversation</div>
                    </div>
                  );
                }

                let lastDate = '';
                return conversation.messages.map((message, index) => {
                  const isFromMe = message.from === user.id;
                  const messageDate = formatDate(message.timestamp);
                  const showDate = messageDate !== lastDate;
                  lastDate = messageDate;

                  return (
                    <React.Fragment key={message.id}>
                      {showDate && (
                        <div style={{
                          textAlign: 'center',
                          color: '#888',
                          fontSize: '12px',
                          margin: '16px 0'
                        }}>
                          {messageDate}
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: isFromMe ? 'flex-end' : 'flex-start'
                      }}>
                        <div style={{
                          maxWidth: '70%',
                          padding: '12px 16px',
                          borderRadius: isFromMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          backgroundColor: isFromMe ? '#ffcc00' : '#333',
                          color: isFromMe ? '#000' : '#f5f5f7',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}>
                          <div style={{ marginBottom: '4px' }}>
                            {message.content}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            opacity: 0.7,
                            textAlign: 'right'
                          }}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                });
              })()}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div style={{
              padding: '20px',
              borderTop: '1px solid #333',
              backgroundColor: '#1a1a1a'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Tapez votre message..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#222',
                    color: '#f5f5f7',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'none',
                    minHeight: '44px',
                    maxHeight: '120px'
                  }}
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: newMessage.trim() ? '#ffcc00' : '#444',
                    color: newMessage.trim() ? '#000' : '#888',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  📤
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#888',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ fontSize: '64px' }}>💬</div>
            <div style={{ fontSize: '18px' }}>Sélectionnez une conversation</div>
            <div style={{ fontSize: '14px' }}>
              Choisissez un contact à gauche pour commencer à discuter
            </div>
          </div>
        )}
      </div>
    </div>
  );
}