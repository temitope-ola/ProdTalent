// TEMPORARY: Force reload - Updated at 2024-01-15
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  increment,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface UserProfile {
  id: string;
  email: string;
  role: 'talent' | 'recruteur' | 'coach';
  avatarUrl?: string;
  displayName?: string;
  bio?: string;
  skills?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  cvUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class FirestoreService {
  // Récupérer le profil de l'utilisateur connecté
  static async getCurrentProfile(userId: string, role: 'talent' | 'recruteur' | 'coach'): Promise<UserProfile | null> {
    try {
      const collectionName = this.getCollectionName(role);
      const userDoc = await getDoc(doc(db, collectionName, userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
                               return {
          id: userDoc.id,
          email: data.email || '',
          role: role,
          avatarUrl: data.avatarUrl || undefined,
          displayName: data.displayName || (data.email && typeof data.email === 'string' ? data.email.split('@')[0] : 'Utilisateur'),
          bio: data.bio || '',
          skills: data.skills || '',
          linkedinUrl: data.linkedinUrl || undefined,
          githubUrl: data.githubUrl || undefined,
          cvUrl: data.cvUrl || undefined,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  // Récupérer un profil par ID (pour voir le profil d'un autre utilisateur)
  static async getProfileById(userId: string): Promise<UserProfile | null> {
    try {
      // Essayer de trouver le profil dans toutes les collections
      const collections = ['Talent', 'Recruteur', 'Coach'];
      
      for (const collectionName of collections) {
        const userDoc = await getDoc(doc(db, collectionName, userId));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          const role = collectionName === 'Talent' ? 'talent' : 
                      collectionName === 'Recruteur' ? 'recruteur' : 'coach';
          
          return {
            id: userDoc.id,
            email: data.email || '',
            role: role,
            avatarUrl: data.avatarUrl || undefined,
            displayName: data.displayName || (data.email && typeof data.email === 'string' ? data.email.split('@')[0] : 'Utilisateur'),
            bio: data.bio || '',
            skills: data.skills || '',
            linkedinUrl: data.linkedinUrl || undefined,
            githubUrl: data.githubUrl || undefined,
            cvUrl: data.cvUrl || undefined,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  // Récupérer tous les profils d'un rôle spécifique
  static async getProfilesByRole(role: 'talent' | 'recruteur' | 'coach'): Promise<UserProfile[]> {
    try {
      const collectionName = this.getCollectionName(role);
      const snapshot = await getDocs(collection(db, collectionName));
      const profiles: UserProfile[] = [];
      
                   snapshot.forEach((doc) => {
               const data = doc.data();
               profiles.push({
                 id: doc.id,
                 email: data.email || '',
                 role: role,
                 avatarUrl: data.avatarUrl || undefined,
                 displayName: data.displayName || (data.email && typeof data.email === 'string' ? data.email.split('@')[0] : 'Utilisateur'),
                 bio: data.bio || '',
                 skills: data.skills || '',
                 linkedinUrl: data.linkedinUrl || undefined,
                 githubUrl: data.githubUrl || undefined,
                 cvUrl: data.cvUrl || undefined,
                 createdAt: data.createdAt.toDate(),
                 updatedAt: data.updatedAt.toDate()
               });
             });
      
      return profiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Erreur lors de la récupération des profils par rôle:', error);
      return [];
    }
  }

  // Récupérer tous les talents (pour les recruteurs et coaches)
  static async getAllTalents(): Promise<UserProfile[]> {
    return this.getProfilesByRole('talent');
  }

  // Récupérer tous les recruteurs (pour les coaches)
  static async getAllRecruteurs(): Promise<UserProfile[]> {
    return this.getProfilesByRole('recruteur');
  }

  // Créer un nouveau profil
           static async createProfile(userId: string, email: string, role: 'talent' | 'recruteur' | 'coach'): Promise<boolean> {
           try {
             const collectionName = this.getCollectionName(role);
             const profileData = {
               email: email,
               displayName: email && typeof email === 'string' ? email.split('@')[0] : 'Utilisateur', // Nom d'affichage par défaut
               bio: '',
               createdAt: new Date(),
               updatedAt: new Date()
             };
      
      await setDoc(doc(db, collectionName, userId), profileData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      return false;
    }
  }

  // Mettre à jour le profil
  static async updateProfile(userId: string, role: 'talent' | 'recruteur' | 'coach', updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const collectionName = this.getCollectionName(role);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, collectionName, userId), updateData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    }
  }

  // Supprimer le profil
  static async deleteProfile(userId: string, role: 'talent' | 'recruteur' | 'coach'): Promise<boolean> {
    try {
      const collectionName = this.getCollectionName(role);
      await deleteDoc(doc(db, collectionName, userId));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du profil:', error);
      return false;
    }
  }

    // Helper pour obtenir le nom de la collection
  private static getCollectionName(role: 'talent' | 'recruteur' | 'coach'): string {
    switch (role) {
      case 'talent': return 'Talent';
      case 'recruteur': return 'Recruteur';
      case 'coach': return 'Coach';
      default: throw new Error(`Rôle invalide: ${role}`);
    }
  }

  // Récupérer tous les utilisateurs d'un rôle spécifique
  static async getUsersByRole(role: 'talent' | 'recruteur' | 'coach'): Promise<UserProfile[]> {
    try {
      const collectionName = this.getCollectionName(role);
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email || '',
          role: role,
          avatarUrl: data.avatarUrl || undefined,
          displayName: data.displayName || (data.email && typeof data.email === 'string' ? data.email.split('@')[0] : 'Utilisateur'),
          bio: data.bio || '',
          skills: data.skills || '',
          linkedinUrl: data.linkedinUrl || undefined,
          githubUrl: data.githubUrl || undefined,
          cvUrl: data.cvUrl || undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return users;
    } catch (error) {
      console.error(`Erreur lors de la récupération des utilisateurs ${role}:`, error);
      return [];
    }
  }

         // Méthode pour convertir une image en base64 (temporaire, idéalement utiliser Firebase Storage)
           static async uploadAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Vérifier la taille avant de lire le fichier (limite Firestore)
      const maxSize = 700 * 1024; // 700KB (pour rester sous la limite Firestore de 1MB en base64)
      if (file.size > maxSize) {
        reject(new Error('L\'image est trop volumineuse. Taille maximale: 700KB'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        
        // Vérifier la taille du base64 pour Firestore (limite 1MB)
        if (result.length > 1000000) { // ~1MB en base64 (limite Firestore)
          reject(new Error('L\'image est trop volumineuse pour Firestore. Taille maximale: 700KB'));
          return;
        }
        
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

    static async uploadCV(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Vérifier la taille avant de lire le fichier (limite Firestore)
      const maxSize = 700 * 1024; // 700KB (pour rester sous la limite Firestore de 1MB en base64)
      if (file.size > maxSize) {
        reject(new Error('Le fichier CV est trop volumineux. Taille maximale: 700KB'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        
        // Vérifier la taille du base64 pour Firestore (limite 1MB)
        if (result.length > 1000000) { // ~1MB en base64 (limite Firestore)
          reject(new Error('Le fichier CV est trop volumineux pour Firestore. Taille maximale: 700KB'));
          return;
        }
        
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Envoyer un message
  static async sendMessage(
    fromUserId: string,
    toUserId: string,
    subject: string,
    message: string,
    fromUserProfile: UserProfile
  ): Promise<boolean> {
    try {
      console.log('Envoi de message:', { fromUserId, toUserId, subject, message });
      
      const messageData = {
        from: {
          id: fromUserId,
          name: fromUserProfile.displayName || (fromUserProfile.email && typeof fromUserProfile.email === 'string' ? fromUserProfile.email.split('@')[0] : 'Utilisateur'),
          email: fromUserProfile.email,
          role: fromUserProfile.role
        },
        to: toUserId,
        subject: subject,
        message: message,
        timestamp: new Date(),
        read: false
      };

      console.log('Données du message:', messageData);

      // Sauvegarder dans la collection Messages
      const messageRef = doc(collection(db, 'Messages'));
      await setDoc(messageRef, messageData);

      console.log('Message envoyé avec succès!');

      // Envoyer une notification par email au destinataire
      try {
        // Récupérer le profil du destinataire
        let toUserProfile = null;
        
        // Essayer de trouver l'utilisateur dans chaque collection
        const roles = ['talent', 'recruteur', 'coach'] as const;
        for (const role of roles) {
          try {
            toUserProfile = await this.getCurrentProfile(toUserId, role);
            if (toUserProfile) break;
          } catch (e) {
            continue;
          }
        }
        
        if (toUserProfile && toUserProfile.email) {
          try {
            // Utiliser Gmail API en premier avec fallback SendGrid
            const { googleIntegratedService } = await import('./googleIntegratedService');
            
            const gmailSent = await googleIntegratedService.sendMessageNotification({
              recipientEmail: toUserProfile.email,
              recipientName: toUserProfile.displayName || toUserProfile.email.split('@')[0],
              senderName: fromUserProfile.displayName || fromUserProfile.email?.split('@')[0] || 'Utilisateur',
              senderRole: fromUserProfile.role === 'talent' ? 'Talent' : fromUserProfile.role === 'recruteur' ? 'Recruteur' : 'Coach',
              messagePreview: message.substring(0, 100) + (message.length > 100 ? '...' : '')
            });
            
            // Utiliser Firebase Functions si Gmail échoue
            if (!gmailSent) {
              const { BackendEmailService } = await import('./backendEmailService');
              const senderName = fromUserProfile.displayName || fromUserProfile.email?.split('@')[0] || 'Utilisateur';
              const recipientName = toUserProfile.displayName || toUserProfile.email.split('@')[0];
              const senderRole = fromUserProfile.role === 'talent' ? 'Talent' : fromUserProfile.role === 'recruteur' ? 'Recruteur' : 'Coach';
              const recipientRole = toUserProfile.role === 'talent' ? 'Talent' : toUserProfile.role === 'recruteur' ? 'Recruteur' : 'Coach';

              // Envoyer notification au destinataire
              await BackendEmailService.sendMessageNotification({
                recipientEmail: toUserProfile.email,
                recipientName: recipientName,
                senderName: senderName,
                senderRole: senderRole,
                messagePreview: message.substring(0, 100) + (message.length > 100 ? '...' : '')
              });

              // Envoyer confirmation à l'expéditeur
              if (fromUserProfile.email) {
                await BackendEmailService.sendMessageConfirmationToSender({
                  senderEmail: fromUserProfile.email,
                  senderName: senderName,
                  recipientName: recipientName,
                  recipientRole: recipientRole,
                  messagePreview: message,
                  subject: 'Message via ProdTalent' // Pas de sujet défini dans ce service
                });
              }
            }
            
            console.log('✅ Notification envoyée au destinataire et confirmation à l\'expéditeur');
          } catch (emailError) {
            console.log('⚠️ Échec envoi notification email:', emailError);
          }
        } else {
          console.log('⚠️ Profil destinataire non trouvé ou email manquant');
        }
      } catch (emailError) {
        console.warn('⚠️ Erreur lors de l\'envoi de la notification email (non bloquant):', emailError);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return false;
    }
  }

  // Récupérer les messages d'un utilisateur (reçus ET envoyés)
  static async getUserMessages(userId: string): Promise<any[]> {
    try {
      console.log('Récupération des messages pour userId:', userId);
      
      const messagesRef = collection(db, 'Messages');
      
      // Approche alternative : récupérer TOUS les messages et filtrer côté client
      // Cela évite les problèmes avec les requêtes Firestore sur les champs imbriqués
      const allMessagesSnapshot = await getDocs(messagesRef);
      console.log('🔥 NOUVEAU CODE ACTIF - Total messages dans la DB:', allMessagesSnapshot.size);
      
      const messages: any[] = [];
      
      // Filtrer les messages côté client
      allMessagesSnapshot.forEach(doc => {
        const data = doc.data();
        
        console.log('=== ANALYSE MESSAGE ===');
        console.log('ID:', doc.id);
        console.log('data.to:', data.to, typeof data.to);
        console.log('data.from:', data.from);
        console.log('userId cherché:', userId, typeof userId);
        console.log('Égalité data.to === userId:', data.to === userId);
        console.log('data.from existe:', !!data.from);
        console.log('data.from.id:', data.from?.id, typeof data.from?.id);
        console.log('data.from.id === userId:', data.from?.id === userId);
        
        // Vérifier si c'est un message reçu
        if (data.to === userId) {
          console.log('✅ MESSAGE REÇU trouvé');
          messages.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp.toDate(),
            type: 'received'
          });
        }
        
        // Vérifier si c'est un message envoyé
        if (data.from && data.from.id === userId) {
          console.log('✅ MESSAGE ENVOYÉ trouvé');
          messages.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp.toDate(),
            type: 'sent'
          });
        }
        
        console.log('========================');
      });
      
      // Trier par timestamp décroissant
      messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      const receivedCount = messages.filter(m => m.type === 'received').length;
      const sentCount = messages.filter(m => m.type === 'sent').length;
      
      console.log('Messages reçus:', receivedCount, 'Messages envoyés:', sentCount);
      console.log('Total messages (reçus + envoyés):', messages.length);
      
      return messages;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
  }

  // Regrouper les messages par conversations
  static groupMessagesByConversation(messages: any[], currentUserId: string): any[] {
    const conversations: { [key: string]: any } = {};
    
    messages.forEach(message => {
      // Déterminer l'interlocuteur (celui qui n'est pas l'utilisateur actuel)
      let interlocutorId: string;
      let interlocutorInfo: any;
      
      if (message.type === 'received') {
        // Si reçu, l'interlocuteur est l'expéditeur
        interlocutorId = message.from.id;
        interlocutorInfo = message.from;
      } else {
        // Si envoyé, l'interlocuteur est le destinataire
        interlocutorId = message.to;
        // Pour les messages envoyés, on n'a que l'ID du destinataire
        // On va essayer de trouver ses informations dans les autres messages
        const receivedFromSameUser = messages.find(m => 
          m.type === 'received' && m.from.id === interlocutorId
        );
        
        if (receivedFromSameUser) {
          interlocutorInfo = receivedFromSameUser.from;
        } else {
          interlocutorInfo = {
            id: message.to,
            name: 'Destinataire',
            email: '',
            role: ''
          };
        }
      }
      
      // Créer ou mettre à jour la conversation
      if (!conversations[interlocutorId]) {
        conversations[interlocutorId] = {
          interlocutor: interlocutorInfo,
          messages: [],
          lastMessage: message,
          unreadCount: 0
        };
      } else {
        // Mettre à jour les infos de l'interlocuteur si on a de meilleures données
        if (interlocutorInfo.name !== 'Destinataire' && 
            conversations[interlocutorId].interlocutor.name === 'Destinataire') {
          conversations[interlocutorId].interlocutor = interlocutorInfo;
        }
      }
      
      conversations[interlocutorId].messages.push(message);
      
      // Mettre à jour le dernier message si plus récent
      if (message.timestamp > conversations[interlocutorId].lastMessage.timestamp) {
        conversations[interlocutorId].lastMessage = message;
      }
      
      // Compter les messages non lus (seulement les reçus)
      if (message.type === 'received' && !message.read) {
        conversations[interlocutorId].unreadCount++;
      }
    });
    
    // Convertir en tableau et trier par dernier message
    return Object.values(conversations).sort((a: any, b: any) => 
      b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime()
    );
  }

  // Regrouper les messages par conversations avec récupération complète des profils
  static async groupMessagesByConversationWithProfiles(messages: any[], currentUserId: string): Promise<any[]> {
    const conversations = this.groupMessagesByConversation(messages, currentUserId);
    
    // Récupérer les profils complets pour les destinataires avec infos incomplètes
    for (const conversation of conversations) {
      if (conversation.interlocutor.name === 'Destinataire') {
        try {
          const profile = await this.getProfileById(conversation.interlocutor.id);
          if (profile) {
            conversation.interlocutor = {
              id: profile.id,
              name: profile.displayName || profile.email?.split('@')[0] || 'Utilisateur',
              email: profile.email,
              role: profile.role
            };
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération du profil ${conversation.interlocutor.id}:`, error);
        }
      }
    }
    
    return conversations;
  }

  // Marquer un message comme lu
  static async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      const messageRef = doc(db, 'Messages', messageId);
      await updateDoc(messageRef, { read: true });
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage du message:', error);
      return false;
    }
  }

  // Déconnexion (méthode de compatibilité)
  static async signOut(): Promise<void> {
    // Cette méthode est gérée par AuthContext, mais on l'ajoute pour compatibilité
    console.log('Déconnexion via FirestoreService');
  }

  // ===== GESTION DES DISPONIBILITÉS DU COACH =====

  // Sauvegarder les disponibilités du coach
  static async saveCoachAvailabilities(coachId: string, availableSlots: string[]): Promise<boolean> {
    try {
      console.log('Sauvegarde des disponibilités pour le coach:', coachId, availableSlots);
      
      const availabilityData = {
        coachId: coachId,
        availableSlots: availableSlots,
        updatedAt: new Date()
      };

      // Sauvegarder dans la collection CoachAvailabilities
      const availabilityRef = doc(db, 'CoachAvailabilities', coachId);
      await setDoc(availabilityRef, availabilityData);

      console.log('Disponibilités sauvegardées avec succès!');
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde des disponibilités:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', error.message);
      throw new Error(`Erreur de sauvegarde: ${error.message}`);
    }
  }

  // Récupérer les disponibilités du coach
  static async getCoachAvailabilities(coachId: string): Promise<string[]> {
    try {
      console.log('Récupération des disponibilités pour le coach:', coachId);
      
      const availabilityRef = doc(db, 'CoachAvailabilities', coachId);
      const availabilityDoc = await getDoc(availabilityRef);
      
      if (availabilityDoc.exists()) {
        const data = availabilityDoc.data();
        console.log('Disponibilités trouvées:', data.availableSlots);
        return data.availableSlots || [];
      }
      
      console.log('Aucune disponibilité trouvée pour ce coach');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des disponibilités:', error);
      return [];
    }
  }

  // Récupérer toutes les disponibilités des coaches (pour les talents)
  static async getAllCoachAvailabilities(): Promise<any[]> {
    try {
      console.log('Récupération de toutes les disponibilités des coaches');
      
      const availabilitiesRef = collection(db, 'CoachAvailabilities');
      const snapshot = await getDocs(availabilitiesRef);
      
      const availabilities: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        availabilities.push({
          id: doc.id,
          ...data,
          updatedAt: data.updatedAt.toDate()
        });
      });
      
      console.log('Disponibilités récupérées:', availabilities);
      return availabilities;
    } catch (error) {
      console.error('Erreur lors de la récupération des disponibilités:', error);
      return [];
    }
  }

  // Sauvegarder une réservation
  static async saveBooking(bookingData: {
    talentId: string;
    talentName: string;
    talentEmail: string;
    slotId: string;
    date: Date;
    time: string;
    subject: string;
    notes?: string;
  }): Promise<boolean> {
    try {
      console.log('Sauvegarde de la réservation:', bookingData);
      
      const booking = {
        ...bookingData,
        timestamp: new Date(),
        status: 'confirmed'
      };

      // Sauvegarder dans la collection Bookings
      const bookingRef = doc(collection(db, 'Bookings'));
      await setDoc(bookingRef, booking);

      console.log('Réservation sauvegardée avec succès!');
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde de la réservation:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', error.message);
      throw new Error(`Erreur de réservation: ${error.message}`);
    }
  }

  // Récupérer les réservations d'un coach
  static async getCoachBookings(coachId: string): Promise<any[]> {
    try {
      console.log('Récupération des réservations pour le coach:', coachId);
      
      const bookingsRef = collection(db, 'Bookings');
      const q = query(bookingsRef, where('coachId', '==', coachId));
      const snapshot = await getDocs(q);
      
      const bookings: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          timestamp: data.timestamp.toDate()
        });
      });
      
      // Trier par date
      bookings.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      console.log('Réservations récupérées:', bookings);
      return bookings;
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      return [];
    }
  }

  // Récupérer les réservations d'un talent
  static async getTalentBookings(talentId: string): Promise<any[]> {
    try {
      console.log('Récupération des réservations pour le talent:', talentId);
      
      const bookingsRef = collection(db, 'Bookings');
      const q = query(bookingsRef, where('talentId', '==', talentId));
      const snapshot = await getDocs(q);
      
      const bookings: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          timestamp: data.timestamp.toDate()
        });
      });
      
      // Trier par date
      bookings.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      console.log('Réservations récupérées:', bookings);
      return bookings;
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      return [];
    }
  }

  // Récupérer tous les coaches
  static async getAllCoaches(): Promise<UserProfile[]> {
    try {
      console.log('Récupération de tous les coaches');
      
      const coachesRef = collection(db, 'Coach');
      const snapshot = await getDocs(coachesRef);
      
      const coaches: UserProfile[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        coaches.push({
          id: doc.id,
          email: data.email || '',
          role: 'coach',
          avatarUrl: data.avatarUrl || undefined,
          displayName: data.displayName || (data.email && typeof data.email === 'string' ? data.email.split('@')[0] : 'Coach'),
          bio: data.bio || '',
          skills: data.skills || '',
          linkedinUrl: data.linkedinUrl || undefined,
          githubUrl: data.githubUrl || undefined,
          cvUrl: data.cvUrl || undefined,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
      });
      
      console.log('Coaches récupérés:', coaches);
      return coaches;
    } catch (error) {
      console.error('Erreur lors de la récupération des coaches:', error);
      return [];
    }
  }

  // Méthodes pour les annonces d'emploi
  static async createJob(jobData: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'Jobs'), {
        ...jobData,
        createdAt: Timestamp.now()
      });
      
      // Envoyer des notifications email à tous les talents
      try {
        // Récupérer tous les talents
        const talents = await this.getUsersByRole('talent');
        const talentEmails = talents
          .map(talent => talent.email)
          .filter(email => email); // Filtrer les emails vides
          
        if (talentEmails.length > 0) {
          try {
            // Utiliser Gmail API en premier avec fallback SendGrid
            const { googleIntegratedService } = await import('./googleIntegratedService');
            let successCount = 0;
            
            // Envoyer une notification à chaque talent
            for (const talent of talents) {
              if (talent.email) {
                try {
                  // Essayer Gmail API d'abord
                  const gmailSent = await googleIntegratedService.sendJobNotification({
                    recipientEmail: talent.email,
                    recipientName: talent.displayName || talent.firstName || talent.email.split('@')[0],
                    jobTitle: jobData.title || 'Nouvelle offre d\'emploi',
                    companyName: jobData.company || 'Entreprise',
                    jobLocation: jobData.location || 'Non spécifié',
                    contractType: jobData.type || 'CDI',
                    jobDescription: jobData.description || ''
                  });
                  
                  if (!gmailSent) {
                    // Fallback Firebase Functions si Gmail échoue
                    const { BackendEmailService } = await import('./backendEmailService');
                    await BackendEmailService.sendJobNotification({
                      recipientEmail: talent.email,
                      recipientName: talent.displayName || talent.firstName || talent.email.split('@')[0],
                      jobTitle: jobData.title || 'Nouvelle offre d\'emploi',
                      companyName: jobData.company || 'Entreprise',
                      jobLocation: jobData.location || 'Non spécifié',
                      contractType: jobData.type || 'CDI',
                      jobDescription: jobData.description || ''
                    });
                  }
                  
                  successCount++;
                } catch (emailError) {
                  console.error(`❌ Erreur envoi notification job à ${talent.email}:`, emailError);
                }
              }
            }
            console.log(`✅ ${successCount}/${talents.length} notifications envoyées (Gmail API ou Firebase Functions) pour la nouvelle offre d'emploi`);
          } catch (serviceError) {
            console.error('❌ Erreur chargement service email:', serviceError);
          }
        }
      } catch (emailError) {
        console.warn('⚠️ Erreur lors de l\'envoi des notifications email pour la nouvelle offre (non bloquant):', emailError);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'annonce:', error);
      throw new Error('Erreur lors de la création de l\'annonce');
    }
  }

  static async getRecruiterJobs(recruiterId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'Jobs'),
        where('recruiterId', '==', recruiterId)
      );
      const querySnapshot = await getDocs(q);
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      // Tri côté client pour éviter l'index composite
      return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
      throw new Error('Erreur lors du chargement des annonces');
    }
  }

  static async getAllActiveJobs(): Promise<{success: boolean, data: any[]}> {
    try {
      const q = query(
        collection(db, 'Jobs'),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      // Tri côté client pour éviter l'index composite
      const sortedJobs = jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return { success: true, data: sortedJobs };
    } catch (error) {
      console.error('Erreur lors du chargement des annonces actives:', error);
      return { success: false, data: [] };
    }
  }

  static async getJobById(jobId: string): Promise<{success: boolean, data?: any, error?: string}> {
    try {
      const docRef = doc(db, 'Jobs', jobId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const jobData = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date()
        };
        return { success: true, data: jobData };
      } else {
        return { success: false, error: 'Annonce non trouvée' };
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'annonce:', error);
      return { success: false, error: 'Erreur lors du chargement de l\'annonce' };
    }
  }

  static async updateJobStatus(jobId: string, status: string): Promise<void> {
    try {
      const docRef = doc(db, 'Jobs', jobId);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new Error('Erreur lors de la mise à jour du statut');
    }
  }

  static async deleteJob(jobId: string): Promise<void> {
    try {
      const docRef = doc(db, 'Jobs', jobId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'annonce:', error);
      throw new Error('Erreur lors de la suppression de l\'annonce');
    }
  }

  static async incrementJobViews(jobId: string): Promise<void> {
    try {
      const docRef = doc(db, 'Jobs', jobId);
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
    }
  }

  static async applyToJob(jobId: string, talentId: string, applicationData: any): Promise<string> {
    try {
      // Créer la candidature
      const applicationRef = await addDoc(collection(db, 'Applications'), {
        jobId,
        talentId,
        ...applicationData,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      // Ajouter la candidature à l'annonce
      const jobRef = doc(db, 'Jobs', jobId);
      await updateDoc(jobRef, {
        applications: arrayUnion(applicationRef.id)
      });

      return applicationRef.id;
    } catch (error) {
      console.error('Erreur lors de la candidature:', error);
      throw new Error('Erreur lors de la candidature');
    }
  }

  static async getJobApplications(jobId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'Applications'),
        where('jobId', '==', jobId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error);
      throw new Error('Erreur lors du chargement des candidatures');
    }
  }

  static async getUserApplications(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'Applications'),
        where('talentId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures utilisateur:', error);
      throw new Error('Erreur lors du chargement des candidatures');
    }
  }

  static async updateApplicationStatus(applicationId: string, status: string): Promise<void> {
    try {
      const docRef = doc(db, 'Applications', applicationId);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de candidature:', error);
      throw new Error('Erreur lors de la mise à jour du statut');
    }
  }

  static async updateJob(jobId: string, jobData: any): Promise<void> {
    try {
      const docRef = doc(db, 'Jobs', jobId);
      await updateDoc(docRef, {
        ...jobData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'annonce:', error);
      throw new Error('Erreur lors de la mise à jour de l\'annonce');
    }
  }

  // Nouvelle fonction pour l'interface de messagerie moderne
  static async getUserMessagesForModernUI(userId: string): Promise<any[]> {
    try {
      console.log('🚀 NOUVELLE FONCTION - getUserMessagesForModernUI pour:', userId);
      
      const messagesRef = collection(db, 'Messages');
      const allMessagesSnapshot = await getDocs(messagesRef);
      
      console.log('📱 Total messages dans DB:', allMessagesSnapshot.size);
      
      const messages: any[] = [];
      
      // Récupérer toutes les informations utilisateurs en une fois
      const usersRef = collection(db, 'Users');
      const usersSnapshot = await getDocs(usersRef);
      const usersMap = new Map();
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        usersMap.set(doc.id, {
          id: doc.id,
          displayName: userData.displayName,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          avatarUrl: userData.avatarUrl
        });
      });
      
      console.log('👥 Utilisateurs chargés:', usersMap.size);
      
      allMessagesSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Message reçu
        if (data.to === userId) {
          const fromUserId = data.from?.id;
          const fromUser = usersMap.get(fromUserId);
          const toUser = usersMap.get(userId);
          
          if (fromUser && toUser) {
            messages.push({
              id: doc.id,
              from: fromUserId,
              to: userId,
              fromUser: fromUser,
              toUser: toUser,
              content: data.message || data.content || '',
              timestamp: data.timestamp?.toDate() || new Date(),
              read: data.read || false
            });
          }
        }
        
        // Message envoyé
        if (data.from?.id === userId) {
          const toUserId = data.to;
          const fromUser = usersMap.get(userId);
          const toUser = usersMap.get(toUserId);
          
          if (fromUser && toUser) {
            messages.push({
              id: doc.id,
              from: userId,
              to: toUserId,
              fromUser: fromUser,
              toUser: toUser,
              content: data.message || data.content || '',
              timestamp: data.timestamp?.toDate() || new Date(),
              read: data.read || false
            });
          }
        }
      });
      
      // Trier par date
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      console.log('✅ Messages formatés pour interface moderne:', messages.length);
      return messages;
      
    } catch (error) {
      console.error('❌ Erreur getUserMessagesForModernUI:', error);
      return [];
    }
  }

  // Fonction sendMessage adaptée pour la nouvelle interface
  static async sendModernMessage(fromUserId: string, toUserId: string, content: string): Promise<boolean> {
    try {
      console.log('📤 Envoi message moderne:', { fromUserId, toUserId, content });
      
      // Récupérer les infos des utilisateurs
      const fromUserDoc = await getDoc(doc(db, 'Users', fromUserId));
      const toUserDoc = await getDoc(doc(db, 'Users', toUserId));
      
      if (!fromUserDoc.exists() || !toUserDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const messageData = {
        from: {
          id: fromUserId,
          name: fromUserDoc.data().displayName || fromUserDoc.data().email?.split('@')[0] || 'Utilisateur',
          email: fromUserDoc.data().email,
          role: fromUserDoc.data().role
        },
        to: toUserId,
        subject: 'Nouveau message',
        message: content,
        timestamp: Timestamp.now(),
        read: false
      };
      
      await addDoc(collection(db, 'Messages'), messageData);
      
      console.log('✅ Message moderne envoyé avec succès');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur envoi message moderne:', error);
      return false;
    }
  }

  // Méthodes pour les préférences email
  static async getEmailPreferences(userId: string): Promise<any | null> {
    try {
      const docRef = doc(db, 'EmailPreferences', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      return null; // Retourner null si aucune préférence n'existe
    } catch (error) {
      console.error('Erreur lors du chargement des préférences email:', error);
      throw new Error('Impossible de charger les préférences email');
    }
  }

  static async saveEmailPreferences(userId: string, preferences: any): Promise<void> {
    try {
      const docRef = doc(db, 'EmailPreferences', userId);
      await setDoc(docRef, {
        ...preferences,
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      console.log('✅ Préférences email sauvegardées:', userId);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences email:', error);
      throw new Error('Impossible de sauvegarder les préférences email');
    }
  }

  // Vérifier si un utilisateur veut recevoir un type d'email spécifique
  static async shouldReceiveEmail(userId: string, emailType: string): Promise<boolean> {
    try {
      const preferences = await this.getEmailPreferences(userId);
      
      if (!preferences) {
        // Si aucune préférence, utiliser les valeurs par défaut
        const defaultPrefs = {
          messages: true,
          messageConfirmations: true,
          appointments: true,
          appointmentReminders: true,
          recommendations: true,
          jobAlerts: true,
          newsletter: false,
          productUpdates: false,
          accountSecurity: true,
          adminNotices: true
        };
        return defaultPrefs[emailType] || false;
      }
      
      return preferences[emailType] || false;
    } catch (error) {
      console.error('Erreur lors de la vérification des préférences email:', error);
      // En cas d'erreur, permettre l'envoi des emails critiques seulement
      const criticalEmails = ['accountSecurity', 'adminNotices', 'appointments'];
      return criticalEmails.includes(emailType);
    }
  }
}
