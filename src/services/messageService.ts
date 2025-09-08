import { collection, query, where, getDocs, doc, setDoc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
// Ancien service supprimé - utilisation de SendGrid template service

export interface MessageUser {
  id: string;
  name: string;
  email: string;
  role: 'talent' | 'coach' | 'recruteur';
}

export interface Message {
  id: string;
  from: MessageUser;
  to: string;
  subject: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'sent' | 'received';
}

export interface Conversation {
  interlocutor: MessageUser;
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
  totalMessages: number;
}

class MessageService {
  
  // Récupérer TOUS les messages d'un utilisateur (envoyés + reçus)
  async getUserMessages(userId: string): Promise<Message[]> {
    try {
      console.log('🔥 NOUVEAU SERVICE - Récupération des messages pour:', userId);
      
      const messagesRef = collection(db, 'Messages');
      const allMessagesSnapshot = await getDocs(messagesRef);
      
      console.log('📊 Total messages dans la DB:', allMessagesSnapshot.size);
      
      const messages: Message[] = [];
      
      allMessagesSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Message reçu par cet utilisateur
        if (data.to === userId) {
          console.log('📥 Message REÇU:', doc.id);
          messages.push({
            id: doc.id,
            from: data.from,
            to: data.to,
            subject: data.subject,
            message: data.message,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
            read: data.read,
            type: 'received'
          });
        }
        
        // Message envoyé par cet utilisateur
        if (data.from?.id === userId) {
          console.log('📤 Message ENVOYÉ:', doc.id);
          messages.push({
            id: doc.id,
            from: data.from,
            to: data.to,
            subject: data.subject,
            message: data.message,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
            read: data.read,
            type: 'sent'
          });
        }
      });
      
      // Trier par timestamp décroissant
      messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      console.log('📈 Résultat:', {
        total: messages.length,
        reçus: messages.filter(m => m.type === 'received').length,
        envoyés: messages.filter(m => m.type === 'sent').length
      });
      
      return messages;
    } catch (error) {
      console.error('❌ Erreur récupération messages:', error);
      return [];
    }
  }

  // Grouper les messages en conversations
  groupMessagesByConversation(messages: Message[], currentUserId: string): Conversation[] {
    const conversations: { [key: string]: Conversation } = {};
    
    messages.forEach(message => {
      let interlocutorId: string;
      let interlocutorInfo: MessageUser;
      
      if (message.type === 'received') {
        // Message reçu -> interlocuteur = expéditeur
        interlocutorId = message.from.id;
        interlocutorInfo = message.from;
      } else {
        // Message envoyé -> interlocuteur = destinataire
        interlocutorId = message.to;
        // Chercher les infos du destinataire dans les autres messages
        const infoFromOtherMessage = messages.find(m => 
          m.type === 'received' && m.from.id === interlocutorId
        );
        
        interlocutorInfo = infoFromOtherMessage ? infoFromOtherMessage.from : {
          id: message.to,
          name: 'Utilisateur',
          email: '',
          role: 'talent' as const
        };
      }
      
      // Créer ou mettre à jour la conversation
      if (!conversations[interlocutorId]) {
        conversations[interlocutorId] = {
          interlocutor: interlocutorInfo,
          messages: [],
          lastMessage: message,
          unreadCount: 0,
          totalMessages: 0
        };
      }
      
      conversations[interlocutorId].messages.push(message);
      conversations[interlocutorId].totalMessages++;
      
      // Mettre à jour le dernier message
      if (message.timestamp > conversations[interlocutorId].lastMessage.timestamp) {
        conversations[interlocutorId].lastMessage = message;
      }
      
      // Compter les messages non lus (seulement les reçus)
      if (message.type === 'received' && !message.read) {
        conversations[interlocutorId].unreadCount++;
      }
      
      // S'assurer d'avoir les bonnes infos de l'interlocuteur
      if (interlocutorInfo.name !== 'Utilisateur' && 
          conversations[interlocutorId].interlocutor.name === 'Utilisateur') {
        conversations[interlocutorId].interlocutor = interlocutorInfo;
      }
    });
    
    // Trier par dernier message
    return Object.values(conversations).sort((a, b) => 
      b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime()
    );
  }

  // Envoyer un message
  async sendMessage(
    fromUserId: string,
    toUserId: string,
    subject: string,
    messageContent: string,
    fromUserProfile: MessageUser,
    recipientInfo?: { email: string; name: string } | null
  ): Promise<boolean> {
    try {
      console.log('📤 Envoi message:', { fromUserId, toUserId, subject });
      
      const messageData = {
        from: {
          id: fromUserId,
          name: fromUserProfile.name,
          email: fromUserProfile.email,
          role: fromUserProfile.role
        },
        to: toUserId,
        subject: subject,
        message: messageContent,
        timestamp: new Date(),
        read: false
      };

      const messageRef = doc(collection(db, 'Messages'));
      await setDoc(messageRef, messageData);
      
      // Envoyer notification Gmail API avec fallback SendGrid si on a les infos du destinataire
      if (recipientInfo) {
        try {
          console.log('📧 Envoi notification Gmail API...');
          const { googleIntegratedService } = await import('./googleIntegratedService');
          
          const gmailSent = await googleIntegratedService.sendMessageNotification({
            recipientEmail: recipientInfo.email,
            recipientName: recipientInfo.name,
            senderName: fromUserProfile.name,
            senderRole: fromUserProfile.role === 'recruteur' ? 'Recruteur' : fromUserProfile.role === 'coach' ? 'Coach' : 'Talent',
            messagePreview: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : '')
          });
          
          if (!gmailSent) {
            // Fallback SendGrid si Gmail échoue
            console.log('📧 Fallback SendGrid template...');
            const { default: sendGridTemplateService } = await import('./sendGridTemplateService');
            await sendGridTemplateService.sendMessageNotification({
              recipientEmail: recipientInfo.email,
              recipientName: recipientInfo.name,
              senderName: fromUserProfile.name,
              senderRole: fromUserProfile.role === 'recruteur' ? 'Recruteur' : fromUserProfile.role === 'coach' ? 'Coach' : 'Talent',
              messagePreview: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : '')
            });
          }
          
          console.log('✅ Notification envoyée (Gmail API ou SendGrid fallback)');
        } catch (emailError) {
          console.error('❌ Erreur notification email:', emailError);
        }
      }
      
      console.log('✅ Message envoyé avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      return false;
    }
  }

  // Marquer un message comme lu
  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      const messageRef = doc(db, 'Messages', messageId);
      await updateDoc(messageRef, { read: true });
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage lu:', error);
      return false;
    }
  }

  // Rechercher des messages
  searchMessages(messages: Message[], searchTerm: string): Message[] {
    if (!searchTerm.trim()) return messages;
    
    const term = searchTerm.toLowerCase();
    return messages.filter(msg =>
      msg.subject.toLowerCase().includes(term) ||
      msg.message.toLowerCase().includes(term) ||
      msg.from.name.toLowerCase().includes(term) ||
      msg.from.email.toLowerCase().includes(term)
    );
  }

  // Obtenir le nombre total de messages non lus
  getTotalUnreadCount(conversations: Conversation[]): number {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }
}

export const messageService = new MessageService();
export default messageService;