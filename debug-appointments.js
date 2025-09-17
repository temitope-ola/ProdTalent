// Script pour debugger les appointments dans Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

async function debugAppointments() {
  console.log('🔍 Debug des appointments...');

  try {
    // Récupérer tous les appointments
    const appointmentsRef = collection(db, 'Appointments');
    const snapshot = await getDocs(appointmentsRef);

    console.log(`📊 Nombre total d'appointments: ${snapshot.size}`);

    const appointments = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        date: data.date,
        time: data.time,
        status: data.status,
        coachId: data.coachId,
        talentName: data.talentName
      });
    });

    // Grouper par date
    const appointmentsByDate = {};
    appointments.forEach(apt => {
      if (!appointmentsByDate[apt.date]) {
        appointmentsByDate[apt.date] = [];
      }
      appointmentsByDate[apt.date].push(apt);
    });

    console.log('\n📅 Appointments par date:');
    Object.keys(appointmentsByDate).sort().forEach(date => {
      console.log(`\n${date}:`);
      appointmentsByDate[date].forEach(apt => {
        console.log(`  - ${apt.time} | Status: ${apt.status} | Talent: ${apt.talentName} | Coach: ${apt.coachId}`);
      });
    });

    // Vérifier les statuts utilisés
    const statusCount = {};
    appointments.forEach(apt => {
      statusCount[apt.status] = (statusCount[apt.status] || 0) + 1;
    });

    console.log('\n📈 Statuts utilisés:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`  - "${status}": ${count} fois`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

debugAppointments().catch(console.error);