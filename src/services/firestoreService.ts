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
import emailNotificationService from './emailNotificationService';

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
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

    static async uploadCV(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Vérifier la taille avant de lire le fichier
      const maxSize = 3 * 1024 * 1024; // 3MB
      if (file.size > maxSize) {
        reject(new Error('Le fichier CV est trop volumineux. Taille maximale: 3MB'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        
        // Vérifier la taille du base64 (environ 33% plus grand que le fichier original)
        if (result.length > 4000000) { // ~4MB en base64
          reject(new Error('Le fichier CV est trop volumineux après conversion. Taille maximale: 3MB'));
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
          const emailResult = await emailNotificationService.sendNewMessage({
            recipientEmail: toUserProfile.email,
            recipientName: toUserProfile.displayName || toUserProfile.email.split('@')[0],
            senderName: fromUserProfile.displayName || fromUserProfile.email?.split('@')[0] || 'Utilisateur',
            senderRole: fromUserProfile.role,
            messagePreview: message.substring(0, 100) + (message.length > 100 ? '...' : '')
          });
          
          if (emailResult.success) {
            console.log('✅ Notification email envoyée avec succès');
          } else {
            console.log('⚠️ Échec envoi notification email:', emailResult.error);
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

  // Récupérer les messages d'un utilisateur
  static async getUserMessages(userId: string): Promise<any[]> {
    try {
      console.log('Récupération des messages pour userId:', userId);
      
      const messagesRef = collection(db, 'Messages');
      // Requête temporaire sans orderBy pour éviter l'index
      const q = query(messagesRef, where('to', '==', userId));
      const snapshot = await getDocs(q);
      
      console.log('Nombre de messages trouvés:', snapshot.size);
      
      const messages: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log('Message trouvé:', { id: doc.id, data });
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate()
        });
      });
      
      // Trier côté client en attendant l'index
      messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      console.log('Messages formatés:', messages);
      return messages;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
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
          const emailResults = await emailNotificationService.sendNewJobPosting({
            jobTitle: jobData.title || 'Nouvelle offre d\'emploi',
            companyName: jobData.company || 'Entreprise',
            recruiterName: jobData.recruiterName || 'Recruteur',
            jobDescription: jobData.description || '',
            talentEmails
          });
          
          const successCount = emailResults.filter(r => r.success).length;
          console.log(`✅ ${successCount}/${talentEmails.length} notifications email envoyées pour la nouvelle offre d'emploi`);
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

  static async getAllActiveJobs(): Promise<any[]> {
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
      return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Erreur lors du chargement des annonces actives:', error);
      throw new Error('Erreur lors du chargement des annonces');
    }
  }

  static async getJobById(jobId: string): Promise<any> {
    try {
      const docRef = doc(db, 'Jobs', jobId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date()
        };
      } else {
        throw new Error('Annonce non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'annonce:', error);
      throw new Error('Erreur lors du chargement de l\'annonce');
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
}
