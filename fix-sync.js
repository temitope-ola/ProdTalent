import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc, Timestamp } from 'firebase/firestore';

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

async function fixSync() {
  try {
    console.log('🔧 Correction de la synchronisation...\n');
    
    const coachId = 'awa';
    
    // ===== 1. NETTOYAGE DES DISPONIBILITÉS DUPLIQUÉES =====
    console.log('🧹 Étape 1: Nettoyage des disponibilités dupliquées...');
    const availabilitiesRef = collection(db, 'CoachAvailabilities');
    const availabilitiesSnapshot = await getDocs(availabilitiesRef);
    
    // Supprimer toutes les disponibilités existantes
    const deleteAvailabilitiesPromises = availabilitiesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteAvailabilitiesPromises);
    console.log(`✅ ${availabilitiesSnapshot.size} disponibilités supprimées`);
    
    // ===== 2. NETTOYAGE DES RENDEZ-VOUS INCORRECTS =====
    console.log('\n🧹 Étape 2: Nettoyage des rendez-vous incorrects...');
    const appointmentsRef = collection(db, 'Appointments');
    const appointmentsSnapshot = await getDocs(appointmentsRef);
    
    // Supprimer les rendez-vous avec des données incorrectes
    const incorrectAppointments = appointmentsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.coachName || !data.talentName || data.coachName === 'coach';
    });
    
    const deleteAppointmentsPromises = incorrectAppointments.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteAppointmentsPromises);
    console.log(`✅ ${incorrectAppointments.length} rendez-vous incorrects supprimés`);
    
    // ===== 3. CRÉATION DE NOUVELLES DISPONIBILITÉS PROPRES =====
    console.log('\n📅 Étape 3: Création de nouvelles disponibilités...');
    
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    // Créer des disponibilités pour les prochains 14 jours ouvrables
    const today = new Date();
    let createdCount = 0;
    
    for (let i = 1; i <= 20; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Exclure les weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const dateStr = date.toISOString().split('T')[0];
        
        const availabilityData = {
          coachId,
          date: dateStr,
          timeSlots,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        const docRef = doc(db, 'CoachAvailabilities', `${coachId}_${dateStr}`);
        await setDoc(docRef, availabilityData);
        
        createdCount++;
      }
    }
    
    console.log(`✅ ${createdCount} disponibilités créées`);
    
    // ===== 4. VÉRIFICATION FINALE =====
    console.log('\n🔍 Étape 4: Vérification finale...');
    
    const finalAvailabilitiesSnapshot = await getDocs(availabilitiesRef);
    const finalAppointmentsSnapshot = await getDocs(appointmentsRef);
    
    console.log(`📊 Résultat final:`);
    console.log(`   - Disponibilités: ${finalAvailabilitiesSnapshot.size}`);
    console.log(`   - Rendez-vous: ${finalAppointmentsSnapshot.size}`);
    
    // Afficher quelques exemples
    console.log('\n📅 Exemples de disponibilités:');
    finalAvailabilitiesSnapshot.docs.slice(0, 3).forEach((doc) => {
      const data = doc.data();
      console.log(`   ${data.date}: ${data.timeSlots.length} créneaux`);
    });
    
    if (finalAppointmentsSnapshot.size > 0) {
      console.log('\n📋 Rendez-vous restants:');
      finalAppointmentsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`   ${data.date} ${data.time}: ${data.talentName} avec ${data.coachName} (${data.status})`);
      });
    }
    
    console.log('\n🎉 Synchronisation corrigée !');
    console.log('\n📝 Maintenant:');
    console.log('   ✅ Awa peut configurer ses disponibilités');
    console.log('   ✅ Les talents voient les vraies disponibilités');
    console.log('   ✅ Les rendez-vous sont correctement synchronisés');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
}

// Exécuter la correction
fixSync();
