# 🔧 Guide de Reconfiguration Firestore pour ProdTalent

## 🎯 Objectif
Reconfigurer complètement votre base de données Firestore pour gérer :
- ✅ Inscriptions (Talent, Recruteur, Coach)
- ✅ Messages entre utilisateurs
- ✅ Rendez-vous coaching
- ✅ Offres d'emploi et candidatures

## 📋 Étapes de Configuration

### Étape 1 : Mettre à jour les règles Firestore

1. **Aller dans la Console Firebase :**
   - Ouvrez [https://console.firebase.google.com](https://console.firebase.google.com)
   - Sélectionnez votre projet `talents-tech-senegal`

2. **Accéder aux règles Firestore :**
   - Menu gauche → **Firestore Database**
   - Onglet **Règles**

3. **Remplacer les règles :**
   - Supprimez tout le contenu actuel
   - Copiez le contenu du fichier `firestore-rules.txt`
   - Collez dans l'éditeur
   - Cliquez sur **"Publier"**

### Étape 2 : Exécuter le script de configuration

1. **Installer les dépendances (si pas déjà fait) :**
   ```bash
   npm install firebase
   ```

2. **Exécuter le script de configuration :**
   ```bash
   node setup-firestore.js
   ```

3. **Vérifier les résultats :**
   Le script va créer automatiquement :
   - 2 exemples de Talents
   - 2 exemples de Recruteurs  
   - 2 exemples de Coaches
   - 2 exemples d'offres d'emploi
   - 2 exemples de candidatures
   - 2 exemples de messages
   - 2 exemples de disponibilités
   - 2 exemples de rendez-vous

## 📊 Structure des Collections

### 👨‍💻 Collection `Talent`
```javascript
{
  id: string,
  email: string,
  role: 'talent',
  displayName: string,
  bio: string,
  skills: string,
  linkedinUrl: string,
  githubUrl: string,
  cvUrl: string,
  avatarUrl: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 🏢 Collection `Recruteur`
```javascript
{
  id: string,
  email: string,
  role: 'recruteur',
  displayName: string,
  bio: string,
  companyName: string,
  companySize: string,
  industry: string,
  linkedinUrl: string,
  avatarUrl: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 🎯 Collection `Coach`
```javascript
{
  id: string,
  email: string,
  role: 'coach',
  displayName: string,
  bio: string,
  specialization: string,
  experience: string,
  linkedinUrl: string,
  avatarUrl: string,
  hourlyRate: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 💼 Collection `Jobs`
```javascript
{
  title: string,
  company: string,
  location: string,
  type: 'fulltime' | 'parttime' | 'contract',
  salary: string,
  description: string,
  requirements: string,
  recruiterId: string,
  status: 'active' | 'closed' | 'draft',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 📝 Collection `Applications`
```javascript
{
  jobId: string,
  talentId: string,
  recruiterId: string,
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected',
  coverLetter: string,
  cvUrl: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 💬 Collection `Messages`
```javascript
{
  senderId: string,
  receiverId: string,
  senderRole: 'talent' | 'recruteur' | 'coach',
  receiverRole: 'talent' | 'recruteur' | 'coach',
  content: string,
  isRead: boolean,
  createdAt: Timestamp
}
```

### 📅 Collection `CoachAvailabilities`
```javascript
{
  coachId: string,
  date: string, // Format: 'YYYY-MM-DD'
  timeSlots: string[], // ['09:00', '10:00', '14:00']
  isAvailable: boolean,
  createdAt: Timestamp
}
```

### 📋 Collection `Appointments`
```javascript
{
  coachId: string,
  talentId: string,
  date: string, // Format: 'YYYY-MM-DD'
  time: string, // Format: 'HH:MM'
  duration: number, // en minutes
  status: 'confirmed' | 'cancelled' | 'completed',
  notes: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## ✅ Vérification

Après la configuration :

1. **Vérifiez dans la Console Firebase :**
   - Firestore Database → Data
   - Vous devriez voir toutes les collections créées

2. **Testez l'application :**
   - Inscrivez-vous avec un nouveau compte
   - Vérifiez que le profil se crée correctement
   - Testez les messages et rendez-vous

## 🚨 En cas de problème

### Erreur "Permission denied"
- Vérifiez que les règles Firestore ont été publiées
- Attendez quelques secondes après la publication

### Erreur "Collection not found"
- Vérifiez que le script `setup-firestore.js` s'est exécuté sans erreur
- Relancez le script si nécessaire

### Erreur d'authentification
- Vérifiez que Firebase Auth est activé dans votre projet
- Vérifiez la configuration Firebase dans votre application

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console du navigateur (F12)
2. Vérifiez les logs dans la Console Firebase
3. Relancez le script de configuration

---

**🎉 Votre base de données Firestore est maintenant prête pour ProdTalent !**
