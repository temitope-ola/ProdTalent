# Configuration Firebase - TalentConnect

## 🚀 **Étapes de configuration (5 minutes)**

### **1. Créer un projet Firebase**
1. Allez sur [firebase.google.com](https://firebase.google.com)
2. Cliquez sur "Créer un projet"
3. Donnez un nom à votre projet (ex: "talentconnect")
4. Activez Google Analytics (optionnel)
5. Cliquez sur "Créer le projet"

### **2. Activer l'authentification**
1. Dans votre projet Firebase, allez dans "Authentication"
2. Cliquez sur "Commencer"
3. Dans l'onglet "Sign-in method", activez "Email/Password"
4. Cliquez sur "Enregistrer"

### **3. Activer Firestore**
1. Dans votre projet Firebase, allez dans "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Mode test" pour commencer
4. Sélectionnez une région (ex: europe-west1)
5. Cliquez sur "Terminé"

### **4. Configurer les règles Firestore**
1. Dans Firestore, allez dans l'onglet "Règles"
2. Remplacez le contenu par le fichier `firestore.rules`
3. Cliquez sur "Publier"

### **5. Obtenir la configuration**
1. Dans votre projet Firebase, cliquez sur l'icône ⚙️ (Paramètres)
2. Allez dans "Paramètres du projet"
3. Dans l'onglet "Général", faites défiler jusqu'à "Vos applications"
4. Cliquez sur l'icône Web (</>) 
5. Donnez un nom à votre app (ex: "talentconnect-web")
6. Copiez la configuration

### **6. Mettre à jour la configuration**
1. Ouvrez `src/firebase.ts`
2. Remplacez `firebaseConfig` par votre configuration :

```typescript
const firebaseConfig = {
  apiKey: "votre_api_key",
  authDomain: "votre_projet.firebaseapp.com",
  projectId: "votre_projet",
  storageBucket: "votre_projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "votre_app_id"
};
```

## ✅ **Avantages de Firebase vs Supabase**

| Aspect | Firebase | Supabase |
|--------|----------|----------|
| **Configuration** | 5 minutes | 30+ minutes |
| **Authentification** | Prête à l'emploi | Configuration SQL |
| **Base de données** | Firestore (NoSQL) | PostgreSQL (SQL) |
| **Règles de sécurité** | Simples | Politiques RLS complexes |
| **SDK** | Excellent | Bon |
| **Gratuit** | Oui | Oui |

## 🎯 **Fonctionnalités implémentées**

✅ **Authentification Firebase**
✅ **Base de données Firestore**
✅ **Règles de sécurité simples**
✅ **Service TypeScript**
✅ **Contexte React**
✅ **Gestion des rôles**

## 🚀 **Test rapide**

1. **Démarrez l'application** : `npm start`
2. **Inscrivez-vous** avec un email valide
3. **Choisissez un rôle** (Talent, Recruteur, Coach)
4. **Connectez-vous** et testez les dashboards

## 📋 **Structure des données**

```javascript
// Collection: users
{
  "userId": {
    "role": "talent|recruiter|coach",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

## 🔧 **Commandes utiles**

```bash
# Démarrer l'application
npm start

# Build pour production
npm run build

# Installer Firebase CLI (optionnel)
npm install -g firebase-tools
```

---

**Firebase est beaucoup plus simple et rapide à configurer !** 🎉
