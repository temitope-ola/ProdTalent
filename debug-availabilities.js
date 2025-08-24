import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

async function debugAvailabilities() {
  try {
    console.log('🔍 Débogage des disponibilités...\n');
    
    const coachId = 'awa';
    
    // ===== 1. VÉRIFIER TOUTES LES DISPONIBILITÉS =====
    console.log('📅 Étape 1: Toutes les disponibilités dans la collection...');
    const availabilitiesRef = collection(db, 'CoachAvailabilities');
    const availabilitiesSnapshot = await getDocs(availabilitiesRef);
    
    console.log(`📊 Nombre total de disponibilités: ${availabilitiesSnapshot.size}`);
    
    availabilitiesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   📄 Document ID: ${doc.id}`);
      console.log(`   📅 Date: ${data.date}`);
      console.log(`   👤 Coach ID: ${data.coachId}`);
      console.log(`   ⏰ Créneaux: ${data.timeSlots.join(', ')}`);
      console.log('   ---');
    });
    
    // ===== 2. TESTER LA RÉCUPÉRATION PAR ID =====
    console.log('\n🎯 Étape 2: Test de récupération par ID...');
    
    availabilitiesSnapshot.forEach(async (doc) => {
      const data = doc.data();
      const expectedId = `${coachId}_${data.date}`;
      console.log(`   📄 ID attendu: ${expectedId}`);
      console.log(`   📄 ID réel: ${doc.id}`);
      console.log(`   ✅ Correspondance: ${expectedId === doc.id ? 'OUI' : 'NON'}`);
      console.log('   ---');
    });
    
    // ===== 3. TESTER LA RÉCUPÉRATION DIRECTE =====
    console.log('\n🔍 Étape 3: Test de récupération directe...');
    
    const testDate = '2025-08-21';
    const expectedId = `${coachId}_${testDate}`;
    
    console.log(`   📅 Date de test: ${testDate}`);
    console.log(`   📄 ID attendu: ${expectedId}`);
    
    const testDoc = doc(db, 'CoachAvailabilities', expectedId);
    const testSnap = await getDoc(testDoc);
    
    if (testSnap.exists()) {
      const testData = testSnap.data();
      console.log(`   ✅ Document trouvé!`);
      console.log(`   👤 Coach ID: ${testData.coachId}`);
      console.log(`   ⏰ Créneaux: ${testData.timeSlots.join(', ')}`);
    } else {
      console.log(`   ❌ Document non trouvé`);
      
      // Chercher avec un autre ID possible
      console.log(`   🔍 Recherche alternative...`);
      availabilitiesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date === testDate) {
          console.log(`   ✅ Trouvé avec ID: ${doc.id}`);
          console.log(`   ⏰ Créneaux: ${data.timeSlots.join(', ')}`);
        }
      });
    }
    
    console.log('\n✅ Débogage terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du débogage:', error);
  }
}

// Exécuter le débogage
debugAvailabilities();
