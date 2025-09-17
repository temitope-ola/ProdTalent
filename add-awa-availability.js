// Script pour ajouter des disponibilités au coach Awa
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, query, where } from 'firebase/firestore';

// Configuration Firebase (copier depuis votre firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyAm9ndfj7FNYaKVGO5eU8q2U6s1O0Qx8NY",
  authDomain: "prodtalent-72b2f.firebaseapp.com",
  projectId: "prodtalent-72b2f",
  storageBucket: "prodtalent-72b2f.appspot.com",
  messagingSenderId: "926508267432",
  appId: "1:926508267432:web:cd30b05b1aa1c8bb90baaa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findCoachAwa() {
  console.log('🔍 Recherche du coach Awa...');

  try {
    // Chercher dans la collection Coaches
    const coachesRef = collection(db, 'Coaches');
    const snapshot = await getDocs(coachesRef);

    console.log(`📊 Nombre de coaches trouvés: ${snapshot.size}`);

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`👤 Coach: ${data.displayName || data.email} (ID: ${doc.id})`);

      // Chercher "Awa" dans les noms
      if (data.displayName?.toLowerCase().includes('awa') ||
          data.email?.toLowerCase().includes('awa')) {
        console.log(`✅ Coach Awa trouvé!`, data);
        return doc.id;
      }
    });

    return null;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return null;
  }
}

async function addAvailabilityForCoach(coachId) {
  console.log(`📅 Ajout de disponibilités pour le coach ${coachId}...`);

  // Dates pour les prochains jours
  const today = new Date();
  const dates = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]); // Format YYYY-MM-DD
  }

  // Créneaux horaires (heure de Toronto)
  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ];

  for (const date of dates) {
    try {
      const availabilityData = {
        coachId: coachId,
        date: date,
        availableSlots: timeSlots,
        timezone: 'America/Toronto', // Timezone de Toronto
        updatedAt: new Date()
      };

      const docRef = doc(db, 'CoachAvailabilities', `${coachId}_${date}`);
      await setDoc(docRef, availabilityData);

      console.log(`✅ Disponibilités ajoutées pour ${date}: ${timeSlots.join(', ')}`);
    } catch (error) {
      console.error(`❌ Erreur pour ${date}:`, error);
    }
  }
}

async function main() {
  console.log('🚀 Démarrage du script...');

  const coachId = await findCoachAwa();

  if (coachId) {
    await addAvailabilityForCoach(coachId);
    console.log('✨ Terminé!');
  } else {
    console.log('❌ Coach Awa non trouvé. Ajout manuel requis.');

    // Lister tous les coaches pour que l'utilisateur puisse choisir
    console.log('\n📋 Liste de tous les coaches:');
    const coachesRef = collection(db, 'Coaches');
    const snapshot = await getDocs(coachesRef);

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.displayName || 'Sans nom'} (${data.email}) - ID: ${doc.id}`);
    });

    console.log('\nPour ajouter des disponibilités manuellement, utilisez un ID de coach ci-dessus.');
  }
}

main().catch(console.error);