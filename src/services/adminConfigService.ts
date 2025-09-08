import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface EmailJSConfig {
  publicKey: string;
  serviceId: string;
  templates: {
    coachingReservation: string;
    appointmentUpdate: string;
    newMessage: string;
    newProfile: string;
    newApplication: string;
    newRecommendation: string;
    newJobPosting: string;
  };
}

const DEFAULT_CONFIG: EmailJSConfig = {
  publicKey: '',
  serviceId: '',
  templates: {
    coachingReservation: '',
    appointmentUpdate: '',
    newMessage: '',
    newProfile: '',
    newApplication: '',
    newRecommendation: '',
    newJobPosting: ''
  }
};

class AdminConfigService {
  private configCache: EmailJSConfig | null = null;
  private readonly COLLECTION_NAME = 'admin_config';
  private readonly DOCUMENT_ID = 'emailjs';

  // Récupérer la configuration EmailJS depuis Firestore
  async getEmailJSConfig(): Promise<EmailJSConfig> {
    try {
      console.log('🔍 Récupération configuration EmailJS depuis Firestore...');
      
      // Utiliser le cache si disponible
      if (this.configCache) {
        console.log('✅ Configuration depuis le cache:', this.configCache);
        return this.configCache;
      }

      const configRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      const configSnap = await getDoc(configRef);

      if (configSnap.exists()) {
        const config = configSnap.data() as EmailJSConfig;
        this.configCache = config;
        console.log('✅ Configuration EmailJS récupérée depuis Firestore:', config);
        return config;
      } else {
        console.log('⚠️ Aucune configuration EmailJS trouvée dans Firestore, utilisation des valeurs par défaut');
        return DEFAULT_CONFIG;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la configuration EmailJS:', error);
      return DEFAULT_CONFIG;
    }
  }

  // Sauvegarder la configuration EmailJS dans Firestore
  async saveEmailJSConfig(config: EmailJSConfig): Promise<boolean> {
    try {
      console.log('💾 Sauvegarde configuration EmailJS dans Firestore...');

      const configRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      await setDoc(configRef, config, { merge: true });

      // Mettre à jour le cache
      this.configCache = config;

      console.log('✅ Configuration EmailJS sauvegardée avec succès dans Firestore');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la configuration EmailJS:', error);
      return false;
    }
  }

  // Vérifier si EmailJS est configuré
  async isEmailJSConfigured(): Promise<boolean> {
    const config = await this.getEmailJSConfig();
    return !!(config.publicKey && config.serviceId);
  }

  // Forcer le rechargement de la configuration (vide le cache)
  invalidateCache(): void {
    this.configCache = null;
    console.log('🔄 Cache de configuration invalidé');
  }

  // Obtenir la configuration en temps réel avec listener
  async getEmailJSConfigWithListener(callback: (config: EmailJSConfig) => void): Promise<() => void> {
    // Import dynamique pour éviter les problèmes de dépendances circulaires
    const { onSnapshot } = await import('firebase/firestore');
    
    const configRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
    
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        const config = doc.data() as EmailJSConfig;
        this.configCache = config;
        console.log('🔄 Configuration EmailJS mise à jour en temps réel:', config);
        callback(config);
      } else {
        console.log('⚠️ Document de configuration supprimé, utilisation des valeurs par défaut');
        callback(DEFAULT_CONFIG);
      }
    }, (error) => {
      console.error('❌ Erreur lors de l\'écoute de la configuration:', error);
      callback(DEFAULT_CONFIG);
    });

    return unsubscribe;
  }
}

// Instance singleton
export const adminConfigService = new AdminConfigService();
export default adminConfigService;