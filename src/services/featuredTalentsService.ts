import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export interface FeaturedTalent {
  id?: string;
  name: string;
  role: string;
  quote: string;
  photoUrl: string;
  order: number;
}

const COLLECTION_NAME = 'featured-talents';

export class FeaturedTalentsService {
  // Récupérer tous les talents mis en avant
  static async getFeaturedTalents(): Promise<FeaturedTalent[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('order'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeaturedTalent[];
    } catch (error) {
      console.error('Erreur lors de la récupération des talents mis en avant:', error);
      return [];
    }
  }

  // Ajouter un nouveau talent
  static async addFeaturedTalent(talent: Omit<FeaturedTalent, 'id'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), talent);
      
      // Envoyer notifications Gmail API (avec fallback SendGrid) aux recruteurs
      try {
        const { FirestoreService } = await import('./firestoreService');
        const { googleIntegratedService } = await import('./googleIntegratedService');
        
        // Récupérer tous les recruteurs actifs
        const recruiters = await FirestoreService.getAllRecruteurs();
        
        if (recruiters && recruiters.length > 0) {
          // Envoyer notification à chaque recruteur
          for (const recruiter of recruiters) {
            if (recruiter.email) {
              // Essayer Gmail API d'abord
              const gmailSent = await googleIntegratedService.sendProfileNotification({
                recipientEmail: recruiter.email,
                recipientName: recruiter.displayName || recruiter.firstName || 'Recruteur',
                talentName: talent.name,
                talentSkills: Array.isArray(talent.skills) ? talent.skills.join(', ') : talent.skills || 'Non spécifié',
                talentExperience: talent.experience || 'Non spécifié'
              });
              
              if (!gmailSent) {
                // Fallback SendGrid si Gmail échoue
                const { default: sendGridTemplateService } = await import('./sendGridTemplateService');
                await sendGridTemplateService.sendProfileNotification({
                  recipientEmail: recruiter.email,
                  recipientName: recruiter.displayName || recruiter.firstName || 'Recruteur',
                  talentName: talent.name,
                  talentSkills: Array.isArray(talent.skills) ? talent.skills.join(', ') : talent.skills || 'Non spécifié',
                  talentExperience: talent.experience || 'Non spécifié'
                });
              }
            }
          }
          console.log(`📧 Notifications de nouveau profil SendGrid envoyées à ${recruiters.length} recruteurs`);
        }
      } catch (emailError) {
        console.error('❌ Erreur envoi notifications nouveau profil:', emailError);
        // Ne pas faire échouer l'ajout si l'email échoue
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du talent:', error);
      return null;
    }
  }

  // Mettre à jour un talent
  static async updateFeaturedTalent(id: string, talent: Partial<FeaturedTalent>): Promise<boolean> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), talent);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du talent:', error);
      return false;
    }
  }

  // Supprimer un talent
  static async deleteFeaturedTalent(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du talent:', error);
      return false;
    }
  }
}
