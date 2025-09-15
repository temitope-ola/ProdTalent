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
// Gmail API sera importe dynamiquement
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
        // Récupérer le profil utilisateur depuis Firestore de façon optimisée
        try {
          console.log('🔄 AuthContext: Chargement du profil pour', firebaseUser.uid);
          
          // Utiliser la nouvelle méthode optimisée de FirestoreService
          const userProfile = await FirestoreService.getUserProfileOptimized(firebaseUser.uid);
          
          if (userProfile) {
            console.log('✅ AuthContext: Profil trouvé', userProfile.role);
            setUser(userProfile);
          } else {
            console.log('⚠️ AuthContext: Aucun profil trouvé, création d\'un profil par défaut...');
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
              console.log('✅ AuthContext: Profil par défaut créé');
            }
          }
        } catch (error) {
          console.error('❌ AuthContext: Erreur lors de la récupération/création du profil:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, role: UserRole) => {
    console.log('🔥 SIGNUP APPELÉ !', { email, role });
    try {
      // Créer l'utilisateur Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Créer le profil dans la bonne collection Firestore
      console.log('🔄 Création du profil Firestore...');
      const result = await FirestoreService.createProfile(firebaseUser.uid, email, role);
      console.log('✅ Profil Firestore créé:', result);
      
      if (!result) {
        console.error('❌ Échec création profil Firestore');
        throw new Error('Erreur lors de la création du profil');
      }
      
      console.log('🎯 Profil validé, préparation email de bienvenue...');

      // Envoyer l'email de bienvenue avec Gmail API (fallback SendGrid)
      console.log('🚀 DÉBUT ENVOI EMAIL DE BIENVENUE...');
      try {
        console.log('📧 Appel Gmail API sendWelcomeEmail avec:', { email, role });
        const { googleIntegratedService } = await import('../services/googleIntegratedService');
        
        const gmailSent = await googleIntegratedService.sendWelcomeEmail({
          recipientEmail: email,
          recipientName: email.split('@')[0], // Utiliser la partie avant @ comme nom par défaut
          userRole: role === 'talent' ? 'Talent' : role === 'recruteur' ? 'Recruteur' : 'Coach',
          dashboardUrl: `https://prodtalent.com/dashboard/${role}`
        });
        
        if (!gmailSent) {
          // Fallback SendGrid si Gmail échoue
          console.log('📧 Fallback SendGrid pour email bienvenue...');
          const sendGridTemplateService = (await import('../services/sendGridTemplateService')).default;
          await sendGridTemplateService.sendWelcomeEmail({
            recipientEmail: email,
            recipientName: email.split('@')[0],
            userRole: role === 'talent' ? 'Talent' : role === 'recruteur' ? 'Recruteur' : 'Coach',
            dashboardUrl: `https://prodtalent.com/dashboard/${role}`
          });
        }
        
        console.log('✅ Email de bienvenue envoyé (Gmail API ou SendGrid fallback)');
      } catch (emailError) {
        console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
        // Ne pas faire échouer l'inscription si l'email échoue
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
