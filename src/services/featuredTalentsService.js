import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
const COLLECTION_NAME = 'featured-talents';
export class FeaturedTalentsService {
    // Récupérer tous les talents mis en avant
    static async getFeaturedTalents() {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('order'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            console.error('Erreur lors de la récupération des talents mis en avant:', error);
            return [];
        }
    }
    // Ajouter un nouveau talent
    static async addFeaturedTalent(talent) {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), talent);
            return docRef.id;
        }
        catch (error) {
            console.error('Erreur lors de l\'ajout du talent:', error);
            return null;
        }
    }
    // Mettre à jour un talent
    static async updateFeaturedTalent(id, talent) {
        try {
            await updateDoc(doc(db, COLLECTION_NAME, id), talent);
            return true;
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour du talent:', error);
            return false;
        }
    }
    // Supprimer un talent
    static async deleteFeaturedTalent(id) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
            return true;
        }
        catch (error) {
            console.error('Erreur lors de la suppression du talent:', error);
            return false;
        }
    }
}
