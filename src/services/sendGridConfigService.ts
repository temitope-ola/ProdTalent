/**
 * Service de configuration SendGrid dans Firestore
 * Remplace EmailJSConfig par SendGridConfig
 */

import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface SendGridConfig {
  apiKey: string;
  verifiedSender: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SendGridConfigService {
  private readonly COLLECTION_NAME = 'SendGridConfig';

  async saveSendGridConfig(config: {
    apiKey: string;
    verifiedSender: string;
  }): Promise<boolean> {
    try {
      console.log('💾 Sauvegarde configuration SendGrid dans Firestore...');

      const configData: SendGridConfig = {
        apiKey: config.apiKey,
        verifiedSender: config.verifiedSender,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Utiliser un ID fixe pour avoir une seule configuration
      await setDoc(doc(db, this.COLLECTION_NAME, 'main'), configData);

      console.log('✅ Configuration SendGrid sauvegardée dans Firestore');
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde SendGrid config:', error);
      return false;
    }
  }

  async getSendGridConfig(): Promise<SendGridConfig | null> {
    try {
      console.log('📋 Lecture configuration SendGrid depuis Firestore...');

      const configRef = collection(db, this.COLLECTION_NAME);
      const configSnap = await getDocs(configRef);

      if (!configSnap.empty) {
        const config = configSnap.docs[0].data() as SendGridConfig;
        console.log('✅ Configuration SendGrid chargée depuis Firestore');
        return config;
      } else {
        console.log('⚠️ Aucune configuration SendGrid trouvée dans Firestore');
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur lecture SendGrid config:', error);
      return null;
    }
  }

  async updateSendGridConfig(updates: Partial<SendGridConfig>): Promise<boolean> {
    try {
      console.log('🔄 Mise à jour configuration SendGrid...');

      const existingConfig = await this.getSendGridConfig();
      if (!existingConfig) {
        console.error('❌ Aucune configuration existante à mettre à jour');
        return false;
      }

      const updatedConfig = {
        ...existingConfig,
        ...updates,
        updatedAt: new Date()
      };

      await setDoc(doc(db, this.COLLECTION_NAME, 'main'), updatedConfig);

      console.log('✅ Configuration SendGrid mise à jour');
      return true;
    } catch (error) {
      console.error('❌ Erreur mise à jour SendGrid config:', error);
      return false;
    }
  }

  async migrateFromEmailJS(): Promise<boolean> {
    try {
      console.log('🔄 Migration EmailJS → SendGrid...');

      // Lire l'ancienne config EmailJS
      const emailJSRef = collection(db, 'EmailJSConfig');
      const emailJSSnap = await getDocs(emailJSRef);

      if (!emailJSSnap.empty) {
        console.log('📧 Configuration EmailJS trouvée, suppression...');
        
        // Supprimer les anciennes configurations EmailJS
        for (const docSnap of emailJSSnap.docs) {
          await deleteDoc(doc(db, 'EmailJSConfig', docSnap.id));
        }
        
        console.log('🗑️ Configuration EmailJS supprimée');
      }

      // Créer une config SendGrid par défaut si aucune n'existe
      const existingConfig = await this.getSendGridConfig();
      if (!existingConfig) {
        const defaultConfig = {
          apiKey: localStorage.getItem('SENDGRID_API_KEY') || '',
          verifiedSender: 'france@edacy.com'
        };

        if (defaultConfig.apiKey) {
          await this.saveSendGridConfig(defaultConfig);
          console.log('✅ Configuration SendGrid par défaut créée');
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur migration EmailJS → SendGrid:', error);
      return false;
    }
  }

  async testSendGridConnection(): Promise<boolean> {
    try {
      const config = await this.getSendGridConfig();
      if (!config || !config.apiKey) {
        console.error('❌ Configuration SendGrid manquante');
        return false;
      }

      // Test simple avec l'API SendGrid
      console.log('🧪 Test connexion SendGrid...');
      
      const response = await fetch('http://localhost:3000/api/sendgrid/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: config.apiKey,
          to: config.verifiedSender,
          from: config.verifiedSender,
          subject: 'Test configuration SendGrid',
          html: '<p>Test de configuration depuis Firestore</p>'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Test SendGrid réussi');
        return true;
      } else {
        console.error('❌ Test SendGrid échoué:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur test SendGrid:', error);
      return false;
    }
  }
}

export const sendGridConfigService = new SendGridConfigService();
export default sendGridConfigService;