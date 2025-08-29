import { doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTION_NAMES } from '../constants';
import { handleServiceError, createApiResponse, AppError } from '../utils/errorHandler';
export class UserService {
    static getCollectionName(role) {
        switch (role) {
            case 'talent': return COLLECTION_NAMES.TALENT;
            case 'recruteur': return COLLECTION_NAMES.RECRUITER;
            case 'coach': return COLLECTION_NAMES.COACH;
            default: throw new AppError(`Rôle invalide: ${role}`, 'INVALID_ROLE');
        }
    }
    static async getCurrentProfile(userId, role) {
        try {
            const collectionName = this.getCollectionName(role);
            const userDoc = await getDoc(doc(db, collectionName, userId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const profile = {
                    id: userDoc.id,
                    email: data.email || '',
                    role: role,
                    avatarUrl: data.avatarUrl,
                    displayName: data.displayName || (data.email?.split('@')[0] || 'Utilisateur'),
                    bio: data.bio || '',
                    skills: data.skills || '',
                    linkedinUrl: data.linkedinUrl,
                    githubUrl: data.githubUrl,
                    cvUrl: data.cvUrl,
                    createdAt: data.createdAt.toDate(),
                    updatedAt: data.updatedAt.toDate()
                };
                return createApiResponse(true, profile);
            }
            return createApiResponse(false, null, 'Profil non trouvé');
        }
        catch (error) {
            return handleServiceError(error, 'récupération du profil');
        }
    }
    static async getProfileById(userId) {
        try {
            const collections = [COLLECTION_NAMES.TALENT, COLLECTION_NAMES.RECRUITER, COLLECTION_NAMES.COACH];
            for (const collectionName of collections) {
                const userDoc = await getDoc(doc(db, collectionName, userId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const role = collectionName === COLLECTION_NAMES.TALENT ? 'talent' :
                        collectionName === COLLECTION_NAMES.RECRUITER ? 'recruteur' : 'coach';
                    const profile = {
                        id: userDoc.id,
                        email: data.email || '',
                        role: role,
                        avatarUrl: data.avatarUrl,
                        displayName: data.displayName || (data.email?.split('@')[0] || 'Utilisateur'),
                        bio: data.bio || '',
                        skills: data.skills || '',
                        linkedinUrl: data.linkedinUrl,
                        githubUrl: data.githubUrl,
                        cvUrl: data.cvUrl,
                        createdAt: data.createdAt.toDate(),
                        updatedAt: data.updatedAt.toDate()
                    };
                    return createApiResponse(true, profile);
                }
            }
            return createApiResponse(false, null, 'Profil non trouvé');
        }
        catch (error) {
            return handleServiceError(error, 'récupération du profil par ID');
        }
    }
    static async getProfilesByRole(role) {
        try {
            const collectionName = this.getCollectionName(role);
            const snapshot = await getDocs(collection(db, collectionName));
            const profiles = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                profiles.push({
                    id: doc.id,
                    email: data.email || '',
                    role: role,
                    avatarUrl: data.avatarUrl,
                    displayName: data.displayName || (data.email?.split('@')[0] || 'Utilisateur'),
                    bio: data.bio || '',
                    skills: data.skills || '',
                    linkedinUrl: data.linkedinUrl,
                    githubUrl: data.githubUrl,
                    cvUrl: data.cvUrl,
                    createdAt: data.createdAt.toDate(),
                    updatedAt: data.updatedAt.toDate()
                });
            });
            const sortedProfiles = profiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            return createApiResponse(true, sortedProfiles);
        }
        catch (error) {
            return handleServiceError(error, 'récupération des profils par rôle');
        }
    }
    static async createProfile(userId, email, role) {
        try {
            const collectionName = this.getCollectionName(role);
            const profileData = {
                email: email,
                displayName: email?.split('@')[0] || 'Utilisateur',
                bio: '',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await setDoc(doc(db, collectionName, userId), profileData);
            return createApiResponse(true, true);
        }
        catch (error) {
            return handleServiceError(error, 'création du profil');
        }
    }
    static async updateProfile(userId, role, updates) {
        try {
            const collectionName = this.getCollectionName(role);
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };
            await updateDoc(doc(db, collectionName, userId), updateData);
            return createApiResponse(true, true);
        }
        catch (error) {
            return handleServiceError(error, 'mise à jour du profil');
        }
    }
    static async deleteProfile(userId, role) {
        try {
            const collectionName = this.getCollectionName(role);
            await deleteDoc(doc(db, collectionName, userId));
            return createApiResponse(true, true);
        }
        catch (error) {
            return handleServiceError(error, 'suppression du profil');
        }
    }
    static async uploadAvatar(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(createApiResponse(true, reader.result));
            };
            reader.onerror = () => {
                resolve(createApiResponse(false, null, 'Erreur lors de la lecture du fichier'));
            };
            reader.readAsDataURL(file);
        });
    }
    static async uploadCV(file) {
        return new Promise((resolve) => {
            const maxSize = 500 * 1024; // 500KB
            if (file.size > maxSize) {
                resolve(createApiResponse(false, null, 'Le fichier CV est trop volumineux. Taille maximale: 500KB'));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                if (result.length > 700000) { // ~700KB en base64
                    resolve(createApiResponse(false, null, 'Le fichier CV est trop volumineux après conversion. Taille maximale: 500KB'));
                    return;
                }
                resolve(createApiResponse(true, result));
            };
            reader.onerror = () => {
                resolve(createApiResponse(false, null, 'Erreur lors de la lecture du fichier'));
            };
            reader.readAsDataURL(file);
        });
    }
}
