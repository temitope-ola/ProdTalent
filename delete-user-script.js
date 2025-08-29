// Script temporaire pour supprimer un utilisateur
// Exécuter avec: node delete-user-script.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';

// Configuration Firebase (remplacez par votre config)
const firebaseConfig = {
  // Vous devez ajouter votre configuration Firebase ici
  // ou importer depuis votre fichier firebase.js
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function deleteUserByEmail(email, role) {
  try {
    console.log(`🔍 Recherche de l'utilisateur ${email} avec le rôle ${role}...`);
    
    // Déterminer le nom de la collection
    let collectionName;
    switch (role) {
      case 'talent': collectionName = 'Talent'; break;
      case 'recruteur': collectionName = 'Recruteur'; break;
      case 'coach': collectionName = 'Coach'; break;
      default: throw new Error(`Rôle invalide: ${role}`);
    }
    
    // Rechercher l'utilisateur par email
    const q = query(collection(db, collectionName), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email ${email} et le rôle ${role}`);
      return false;
    }
    
    // Supprimer tous les documents trouvés
    let deletedCount = 0;
    for (const docSnapshot of querySnapshot.docs) {
      console.log(`🗑️ Suppression du document ${docSnapshot.id}...`);
      await deleteDoc(doc(db, collectionName, docSnapshot.id));
      deletedCount++;
    }
    
    console.log(`✅ ${deletedCount} document(s) supprimé(s) pour l'email ${email}`);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du script de suppression d\'utilisateur...');
  
  const email = 'coach@prodtalent.com';
  const role = 'talent';
  
  const success = await deleteUserByEmail(email, role);
  
  if (success) {
    console.log(`✅ Utilisateur ${email} supprimé avec succès !`);
  } else {
    console.log(`❌ Échec de la suppression de l'utilisateur ${email}`);
  }
  
  process.exit(0);
}

// Exécuter le script
main().catch(console.error);