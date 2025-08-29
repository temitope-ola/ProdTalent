# Guide d'intégration Google Calendar pour ProdTalent

## 🎯 **Nouvelle approche simplifiée**

L'intégration Google Calendar a été simplifiée pour une meilleure expérience utilisateur :

### **Pour l'administrateur de ProdTalent :**
- **Configuration unique** des clés Google API
- **Tous les coaches** utilisent la même intégration
- **Pas de configuration** nécessaire pour chaque coach

### **Pour les coaches :**
- **Connexion simple** avec leur compte Google
- **Gestion directe** de leur agenda personnel
- **Interface intuitive** pour créer/gérer des RDV

---

## 📋 **Configuration (Administrateur uniquement)**

### **1. Créer un projet Google Cloud**

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google Calendar :
   - Menu → APIs & Services → Library
   - Recherchez "Google Calendar API"
   - Cliquez sur "Enable"

### **2. Configurer les identifiants OAuth**

1. Menu → APIs & Services → Credentials
2. Cliquez sur "Create Credentials" → "OAuth 2.0 Client IDs"
3. Sélectionnez "Web application"
4. Ajoutez les URIs autorisés :
   - `http://localhost:5173` (développement)
   - `http://localhost:5174` (développement alternatif)
   - `https://votre-domaine.com` (production)
5. Notez le **Client ID** généré

### **3. Créer une clé API**

1. Menu → APIs & Services → Credentials
2. Cliquez sur "Create Credentials" → "API Key"
3. Notez la **API Key** générée

### **4. Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration Google Calendar API
VITE_GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=votre-api-key

# Configuration Firebase (déjà existante)
VITE_FIREBASE_API_KEY=votre-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=votre-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-project-id
VITE_FIREBASE_STORAGE_BUCKET=votre-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre-sender-id
VITE_FIREBASE_APP_ID=votre-app-id
```

### **5. Redémarrer le serveur**

```bash
npm run dev
```

---

## 🚀 **Utilisation (Coaches)**

### **Connexion**
1. Ouvrez le dashboard coach
2. Cliquez sur "Agenda Google Calendar"
3. Cliquez sur "Se connecter avec Google"
4. Autorisez l'accès à votre agenda

### **Gestion des rendez-vous**
- **Créer** : Remplissez le formulaire et cliquez sur "Créer"
- **Voir** : Tous vos événements s'affichent automatiquement
- **Supprimer** : Cliquez sur "Supprimer" à côté de l'événement

---

## 🔒 **Sécurité**

### **Bonnes pratiques**
- ✅ Gardez vos clés API secrètes
- ✅ Utilisez des URIs autorisés spécifiques
- ✅ Surveillez l'utilisation de l'API
- ✅ Désactivez les clés non utilisées

### **Limitations**
- Chaque coach accède uniquement à son propre agenda
- Les données ne sont pas stockées sur nos serveurs
- Conformité RGPD respectée

---

## 🛠️ **Dépannage**

### **Erreur "Impossible de se connecter"**
- Vérifiez que les clés API sont correctes
- Assurez-vous que l'API Google Calendar est activée
- Vérifiez les URIs autorisés

### **Erreur "Accès refusé"**
- Le coach doit autoriser l'accès à son agenda
- Vérifiez les permissions OAuth

### **Événements non visibles**
- Vérifiez que l'événement est dans le calendrier principal
- Les événements privés peuvent ne pas s'afficher

---

## 📞 **Support**

Pour toute question technique :
- Consultez la [documentation Google Calendar API](https://developers.google.com/calendar)
- Contactez l'équipe technique de ProdTalent

---

## ✅ **Avantages de cette approche**

1. **Simplicité** : Les coaches se connectent en un clic
2. **Sécurité** : Chaque coach garde le contrôle de son agenda
3. **Flexibilité** : Utilisation de l'outil familier (Google Calendar)
4. **Maintenance** : Configuration unique pour l'administrateur
5. **Évolutivité** : Facile d'ajouter de nouveaux coaches
