import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';
import { UserRole } from '../types';
import { FirestoreService, UserProfile } from '../services/firestoreService';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

      if (firebaseUser) {
        // Récupérer le profil utilisateur depuis Firestore
        try {
          // Essayer de trouver le profil dans les différentes collections
          let userProfile = null;
          const roles: UserRole[] = ['talent', 'recruteur', 'coach'];
          
          for (const role of roles) {
            try {
              const result = await FirestoreService.getCurrentProfile(firebaseUser.uid, role);
              if (result) {
                userProfile = result;
                break;
              }
            } catch (error) {
              // Continuer avec le prochain rôle
            }
          }
          
          if (userProfile) {
            setUser(userProfile);
          } else {
            console.log('Aucun profil trouvé, création d\'un profil par défaut...');
            // Créer un profil par défaut
            const createResult = await FirestoreService.createProfile(firebaseUser.uid, firebaseUser.email!, 'talent');
            
            if (createResult) {
              const defaultProfile: UserProfile = {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                role: 'talent',
                displayName: firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Utilisateur',
                bio: '',
                createdAt: new Date(),
                updatedAt: new Date()
              };
              setUser(defaultProfile);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération/création du profil:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      // Créer l'utilisateur Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Créer le profil dans la bonne collection Firestore
      const result = await FirestoreService.createProfile(firebaseUser.uid, email, role);
      
      if (!result) {
        throw new Error('Erreur lors de la création du profil');
      }

      // Le profil sera automatiquement chargé par onAuthStateChanged
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw new Error(error.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {

      await signInWithEmailAndPassword(auth, email, password);
      
      // Le profil sera automatiquement chargé par onAuthStateChanged
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
