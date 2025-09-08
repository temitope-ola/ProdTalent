import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './NotificationManager';
import messageService, { Message, Conversation, MessageUser } from '../services/messageService';
import { FirestoreService } from '../services/firestoreService';

interface MessageCenterProps {
  userRole: 'talent' | 'coach' | 'recruteur';
  onBack?: () => void;
}

const MessageCenter: React.FC<MessageCenterProps> = ({ userRole, onBack }) => {
  // CSS responsive WhatsApp-style
  const responsiveCSS = `
    .message-center-mobile-view {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #0a0a0a;
      z-index: 1000;
    }
    
    .message-center-mobile-header {
      background: #111;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid #333;
    }
    
    .message-center-back-btn {
      background: none;
      border: none;
      color: #ffcc00;
      font-size: 18px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
    }
    
    .message-center-back-btn:hover {
      background: rgba(255, 204, 0, 0.1);
    }
  `;

  // Injecter le CSS dans le document
  React.useEffect(() => {
    const styleId = 'message-center-responsive';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = responsiveCSS;
    
    return () => {
      const element = document.getElementById(styleId);
      if (element) element.remove();
    };
  }, []);
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  
  // États
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour la composition
  const [newMessage, setNewMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientRole, setRecipientRole] = useState<'talent' | 'coach'>('talent');
  const [messageSubject, setMessageSubject] = useState('');
  const [replyToUserId, setReplyToUserId] = useState<string>('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [showConversationList, setShowConversationList] = useState(true);
  
  // Force desktop sur les écrans > 480px
  useEffect(() => {
    if (window.innerWidth > 480) {
      setIsMobile(false);
      setShowConversationList(true);
    }
  }, []);
  
  // Refs pour auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const firstUnreadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  // Auto-scroll vers les messages non lus ou vers le bas
  useEffect(() => {
    if (selectedConversation) {
      // Attendre que le DOM soit mis à jour
      setTimeout(() => {
        // Chercher le premier message non lu reçu
        if (firstUnreadRef.current) {
          firstUnreadRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (messagesEndRef.current) {
          // S'il n'y a pas de message non lu, aller vers le bas
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [selectedConversation]);

  // Détecter le mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 480;
      setIsMobile(mobile);
      if (!mobile) {
        setShowConversationList(true); // Toujours montrer la liste sur desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadMessages = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('🔥 MESSAGECENTER - Chargement messages pour user:', user.id);
      
      const messages = await messageService.getUserMessages(user.id);
      console.log('📥 Messages récupérés:', messages.length);
      
      const conversationsData = messageService.groupMessagesByConversation(messages, user.id);
      console.log('📊 Conversations groupées:', conversationsData.length);
      console.log('📋 Détail conversations:', conversationsData);
      
      setConversations(conversationsData);
    } catch (error) {
      console.error('❌ Erreur chargement messages:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les messages'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationClick = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsComposing(false);
    
    if (isMobile) {
      setShowConversationList(false);
    }
    
    // Marquer les messages non lus comme lus
    const unreadMessages = conversation.messages.filter(msg => 
      msg.type === 'received' && !msg.read
    );
    
    for (const msg of unreadMessages) {
      await messageService.markMessageAsRead(msg.id);
    }
    
    // Recharger les conversations pour mettre à jour les compteurs
    await loadMessages();
  };

  const handleSendMessage = async () => {
    console.log('🚀 handleSendMessage appelé');
    console.log('📊 État actuel:', {
      user: user?.id,
      newMessage: newMessage.trim(),
      isComposing,
      selectedConversation: selectedConversation?.interlocutor.id,
      replyToUserId,
      recipientEmail
    });

    if (!user || !newMessage.trim()) {
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs'
      });
      return;
    }

    try {
      let targetUserId = '';
      
      // Déterminer l'ID du destinataire
      if (replyToUserId) {
        // Mode réponse - on a déjà l'ID
        targetUserId = replyToUserId;
        console.log('📤 Mode réponse, targetUserId:', targetUserId);
      } else if (selectedConversation) {
        // Conversation existante (peu importe si on compose ou pas)
        targetUserId = selectedConversation.interlocutor.id;
        console.log('📤 Mode conversation existante, targetUserId:', targetUserId);
      } else if (recipientEmail) {
        // Pour un nouveau message, utiliser l'email comme identifiant temporaire
        targetUserId = recipientEmail;
        console.log('📤 Nouveau message vers email:', recipientEmail);
      } else {
        console.error('❌ Aucun destinataire trouvé:', { replyToUserId, selectedConversation, recipientEmail });
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Veuillez spécifier un destinataire'
        });
        return;
      }

      const subject = messageSubject || (selectedConversation ? 
        `Réponse: ${selectedConversation.lastMessage.subject}` : 
        'Nouveau message'
      );

      // Récupérer les informations du destinataire pour EmailJS
      let recipientInfo = null;
      if (replyToUserId) {
        // Mode réponse - on a déjà les infos de l'interlocuteur
        const conversation = conversations.find(conv => conv.interlocutor.id === replyToUserId);
        if (conversation) {
          recipientInfo = {
            email: conversation.interlocutor.email,
            name: conversation.interlocutor.name
          };
        }
      } else if (recipientEmail) {
        // Nouveau message - utiliser directement l'email
        recipientInfo = {
          email: recipientEmail,
          name: recipientEmail.split('@')[0] || 'Utilisateur'
        };
      }

      const success = await messageService.sendMessage(
        user.id,
        targetUserId,
        subject,
        newMessage.trim(),
        {
          id: user.id,
          name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
          email: user.email || '',
          role: userRole
        },
        recipientInfo
      );

      if (success) {
        setNewMessage('');
        setMessageSubject('');
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
      console.error('❌ Erreur envoi message:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: "Une erreur est survenue lors de l'envoi"
      });
    }
  };


  const handleBackToList = () => {
    setSelectedConversation(null);
    setIsComposing(false);
    setShowConversationList(true);
  };

  const startComposing = (conversation?: Conversation) => {
    setIsComposing(true);
    
    if (isMobile) {
      setShowConversationList(false);
    }
    
    if (conversation) {
      // Mode réponse - garder la conversation sélectionnée
      console.log('🔄 Démarrage composition pour conversation:', conversation.interlocutor);
      setSelectedConversation(conversation);
      setRecipientEmail(conversation.interlocutor.email);
      setRecipientRole(conversation.interlocutor.role === 'recruteur' ? 'talent' : conversation.interlocutor.role);
      setMessageSubject(`Réponse: ${conversation.lastMessage.subject}`);
      setReplyToUserId(conversation.interlocutor.id);
      console.log('✅ replyToUserId défini:', conversation.interlocutor.id);
    } else {
      // Nouveau message
      console.log('🆕 Nouveau message');
      setSelectedConversation(null);
      setRecipientEmail('');
      setMessageSubject('');
      setReplyToUserId('');
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

  const getTotalUnreadCount = () => {
    return messageService.getTotalUnreadCount(conversations);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.interlocutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
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

  console.log('🖥️ Rendu interface:', { 
    isMobile, 
    windowWidth: window.innerWidth, 
    showConversationList, 
    conversationsCount: conversations.length,
    isLoading 
  });

  // TEMPORAIRE: Désactiver le mobile pour debug
  if (false && isMobile) {
    // Vue liste des conversations
    if (showConversationList) {
      return (
        <div className="message-center-mobile-view">
          <div className="message-center-mobile-header">
            <button 
              className="message-center-back-btn"
              onClick={onBack}
            >
              ← Retour
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: '#ffcc00', margin: 0, fontSize: '18px' }}>
                Messages
              </h1>
              <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => startComposing()}
              style={{
                backgroundColor: '#ffcc00',
                color: '#000',
                border: 'none',
                borderRadius: '20px',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              +
            </button>
          </div>

          {/* Liste conversations mobile */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            padding: '8px 0'
          }}>
            {isLoading ? (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: '#666' 
              }}>
                Chargement des conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: '#666' 
              }}>
                <p>Aucune conversation</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Cliquez sur + pour créer un nouveau message
                </p>
              </div>
            ) : filteredConversations.map((conversation, index) => {
              if (!conversation?.interlocutor?.id) {
                console.warn('Conversation invalide:', conversation);
                return null;
              }
              
              console.log('Rendu conversation:', index, conversation.interlocutor.name);
              return (
              <div
                key={conversation.interlocutor.id}
                onClick={() => handleConversationClick(conversation)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #222',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {conversation.interlocutor.name.charAt(0).toUpperCase()}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ 
                      color: '#f5f5f7', 
                      margin: 0,
                      fontSize: '16px'
                    }}>
                      {conversation.interlocutor.name}
                    </h4>
                    <small style={{ color: '#666', fontSize: '12px' }}>
                      {formatDate(conversation.lastMessage.timestamp)}
                    </small>
                  </div>
                  
                  <p style={{
                    color: '#999',
                    fontSize: '14px',
                    margin: '4px 0 0 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conversation.lastMessage.type === 'sent' && 'Vous: '}
                    {conversation.lastMessage.message}
                  </p>
                </div>

                {conversation.unreadCount > 0 && (
                  <div style={{
                    backgroundColor: '#ffcc00',
                    color: '#000',
                    borderRadius: '12px',
                    minWidth: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
              );
            }).filter(Boolean)}
          </div>
        </div>
      );
    }

    // Vue conversation mobile (sera implémentée après)
    return <div>Mobile conversation view - TODO</div>;
  }

  // Desktop: Interface classique
  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      padding: '16px',
      overflow: 'hidden'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #333'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {onBack && (
              <button
                onClick={onBack}
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
            )}
            <div>
              <h1 style={{ color: '#ffcc00', margin: 0 }}>
                Centre de Messages
              </h1>
              <p style={{ margin: '8px 0 0 0', color: '#999' }}>
                {getTotalUnreadCount()} message{getTotalUnreadCount() > 1 ? 's' : ''} non lu{getTotalUnreadCount() > 1 ? 's' : ''}
                {' • '}
                {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => startComposing()}
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

        <div 
          className="message-center-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '400px 1fr',
            gap: '16px',
            height: 'calc(100vh - 160px)',
            overflow: 'hidden'
          }}>
          {/* Sidebar - Liste des conversations */}
          <div 
            className="message-center-sidebar"
            style={{
              backgroundColor: '#111',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              maxHeight: 'calc(100vh - 160px)'
            }}>
            {/* Barre de recherche */}
            <div style={{ padding: '16px', borderBottom: '1px solid #333' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            {/* Liste des conversations */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '8px'
            }}>
              {filteredConversations.length === 0 ? (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#999' 
                }}>
                  {searchTerm ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                </div>
              ) : (
                filteredConversations.map((conversation, index) => (
                  <div
                    key={`${conversation.interlocutor.id}-${index}`}
                    onClick={() => handleConversationClick(conversation)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #333',
                      cursor: 'pointer',
                      backgroundColor: selectedConversation?.interlocutor.id === conversation.interlocutor.id ? '#222' : 'transparent',
                      borderLeft: conversation.unreadCount > 0 ? '3px solid #ffcc00' : 'none'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px' 
                    }}>
                      <strong style={{ 
                        color: conversation.unreadCount > 0 ? '#ffcc00' : '#f5f5f7',
                        fontSize: '16px'
                      }}>
                        {conversation.interlocutor.name}
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {conversation.unreadCount > 0 && (
                          <span style={{
                            backgroundColor: '#ffcc00',
                            color: '#000',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {conversation.unreadCount}
                          </span>
                        )}
                        <small style={{ color: '#666', fontSize: '12px' }}>
                          {formatDate(conversation.lastMessage.timestamp)}
                        </small>
                      </div>
                    </div>
                    
                    <p style={{ color: '#888', margin: '0 0 4px 0', fontSize: '12px' }}>
                      {conversation.interlocutor.email} • {conversation.interlocutor.role}
                    </p>
                    
                    <p style={{
                      color: '#999',
                      fontSize: '14px',
                      margin: '0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conversation.lastMessage.type === 'sent' && 'Vous: '}
                      {conversation.lastMessage.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Zone principale */}
          <div 
            className="message-center-main"
            style={{
              backgroundColor: '#111',
              borderRadius: '4px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}>
            {isComposing ? (
              // Mode composition
              <div 
                className="message-center-form"
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 200px)',
                  overflow: 'hidden'
                }}>
                <h3 style={{ color: '#ffcc00', marginTop: 0, marginBottom: '12px' }}>
                  Nouveau message
                </h3>
                
                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  marginBottom: '12px',
                  minHeight: 0
                }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Destinataire (email) *
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px'
                    }}
                    placeholder="email@exemple.com"
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Sujet *
                  </label>
                  <input
                    type="text"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px'
                    }}
                    placeholder="Sujet du message"
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Message *
                  </label>
                  <textarea
                    className="message-center-textarea"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{
                      width: '100%',
                      height: '120px',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Votre message..."
                  />
                </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #333',
                  marginTop: '12px',
                  flexShrink: 0
                }}>
                  <button
                    onClick={handleSendMessage}
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
                      setMessageSubject('');
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
            ) : selectedConversation ? (
              // Vue conversation
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ color: '#ffcc00', marginTop: 0, marginBottom: '8px' }}>
                    Conversation avec {selectedConversation.interlocutor.name}
                  </h3>
                  <p style={{ color: '#999', margin: 0, fontSize: '14px' }}>
                    {selectedConversation.interlocutor.email} • 
                    {selectedConversation.interlocutor.role} • 
                    {selectedConversation.totalMessages} message{selectedConversation.totalMessages > 1 ? 's' : ''}
                  </p>
                </div>
                
                {/* Messages */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  marginBottom: '12px',
                  padding: '8px',
                  maxHeight: 'calc(100vh - 320px)',
                  minHeight: '300px'
                }}>
                  {selectedConversation.messages
                    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                    .map((msg, index) => {
                      // Trouver le premier message non lu reçu
                      const isFirstUnread = msg.type === 'received' && !msg.read && 
                        selectedConversation.messages
                          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                          .findIndex(m => m.type === 'received' && !m.read) === index;
                      
                      return (
                    <div
                      key={msg.id}
                      ref={isFirstUnread ? firstUnreadRef : null}
                      style={{
                        marginBottom: '16px',
                        padding: '16px',
                        backgroundColor: '#333',
                        borderRadius: '4px',
                        borderLeft: msg.type === 'sent' ? '4px solid #61BFAC' : '4px solid #ffcc00'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: '#f5f5f7' }}>
                            {msg.type === 'sent' ? 'Vous' : msg.from.name}
                          </span>
                          {msg.type === 'received' && !msg.read && (
                            <span style={{
                              backgroundColor: '#ffcc00',
                              color: '#000',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}>
                              NOUVEAU
                            </span>
                          )}
                        </div>
                        <small style={{ color: '#999', fontSize: '12px' }}>
                          {formatDate(msg.timestamp)}
                        </small>
                      </div>
                      
                      <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '14px' }}>
                        {msg.subject}
                      </h4>
                      
                      <p style={{ 
                        margin: 0, 
                        lineHeight: '1.6', 
                        color: '#f5f5f7',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {msg.message}
                      </p>
                    </div>
                      );
                    })}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: '8px 0' }}>
                  <button
                    onClick={() => startComposing(selectedConversation)}
                    style={{
                      padding: '10px 20px',
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
              </div>
            ) : (
              // Vue par défaut
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>
                  Centre de Messages
                </h3>
                <p style={{ margin: '0 0 20px 0' }}>
                  Sélectionnez une conversation ou créez un nouveau message
                </p>
                <button
                  onClick={() => startComposing()}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;