import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDiUUZ8T_gTAp7LdqPNnuFl9U7Gl7Ecfik",
  authDomain: "talents-tech-senegal.firebaseapp.com",
  projectId: "talents-tech-senegal",
  storageBucket: "talents-tech-senegal.firebasestorage.app",
  messagingSenderId: "759306069327",
  appId: "1:759306069327:web:f711a2b907537e9dead13a",
  measurementId: "G-0KNNCCGGEJ"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findAwaId() {
  try {
    console.log('🔍 Recherche de l\'ID d\'Awa...\n');
    
    // ===== 1. VÉRIFIER LA COLLECTION COACH =====
    console.log('👤 Étape 1: Vérification de la collection Coach...');
    const coachesRef = collection(db, 'Coach');
    const coachesSnapshot = await getDocs(coachesRef);
    
    console.log(`📊 Nombre de coaches trouvés: ${coachesSnapshot.size}`);
    
    coachesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   📄 Document ID: ${doc.id}`);
      console.log(`   📧 Email: ${data.email}`);
      console.log(`   👤 Nom: ${data.displayName}`);
      console.log(`   🏷️  Rôle: ${data.role}`);
      console.log('   ---');
    });
    
    // ===== 2. TROUVER AWA =====
    console.log('\n🎯 Étape 2: Recherche d\'Awa...');
    
    let awaFound = false;
    coachesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email === 'awa@edacy.com' || data.displayName === 'Awa') {
        console.log(`   ✅ Awa trouvée !`);
        console.log(`   📄 ID: ${doc.id}`);
        console.log(`   📧 Email: ${data.email}`);
        console.log(`   👤 Nom: ${data.displayName}`);
        awaFound = true;
      }
    });
    
    if (!awaFound) {
      console.log('   ❌ Awa non trouvée dans la collection Coach');
    }
    
    console.log('\n✅ Recherche terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error);
  }
}

// Exécuter la recherche
findAwaId();
