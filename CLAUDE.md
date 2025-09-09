# 🤖 Claude Code - Documentation Technique ProdTalent

## 📋 **Commandes importantes**
```bash
# Démarrer le serveur
npm run dev

# Build de production
npm run build

# Lint et vérifications
npm run lint
npm run typecheck
```

## 🔧 **Fonctionnalités principales actives**

### ✅ **Système de messagerie moderne (WhatsApp-like)**
- **Fichier principal :** `src/pages/ModernMessagesPage.tsx`
- **Interface :** 2 colonnes (contacts à gauche, chat à droite)
- **Fonctions utilisées :**
  - `FirestoreService.getUserMessages()` - Charge messages existants
  - `FirestoreService.sendMessage()` - Envoi nouveaux messages
- **EmailJS :** Intégré pour notifications automatiques lors de nouveaux messages

### ✅ **Système de recommandations simplifié**
- **Fichier principal :** `src/components/SimpleRecommendationModal.tsx` 
- **Base de données :** Collection `recommendations` avec structure claire
- **Champs obligatoires :** `jobId`, `coachId`, `talentId`, `recruiterId`
- **EmailJS :** Notifications automatiques au talent ET recruteur
- **Pages d'affichage :** 
  - `src/pages/TalentRecommendationsPage.tsx` (pour talents)
  - Boutons intelligents : "Voir l'offre" si `jobId` existe, sinon "Voir profil recruteur"

### ✅ **Service EmailJS intégré** (À remplacer par Google)
- **Fichier :** `src/services/emailNotificationService.ts`
- **Configuration :** Firestore `EmailJSConfig` collection OU variables .env
- **⚠️ Problème :** Mails non reçus, fiabilité limitée

### 🚀 **Service Google intégré (NOUVEAU - RECOMMANDÉ)**
- **Fichier principal :** `src/services/googleIntegratedService.ts`
- **Page de config :** `src/pages/GoogleConfigPage.tsx` - Accessible via `/google-config`
- **Fonctionnalités :**
  - 📧 **Gmail API** - Envoi d'emails professionnel et fiable
  - 📅 **Calendar API** - Création automatique d'événements
  - 🎯 **Notifications intelligentes** - Templates HTML riches
  - 🔐 **OAuth sécurisé** - Authentification Google native
- **Avantages vs EmailJS :**
  - ✅ Plus fiable et professionnel
  - ✅ Intégration Calendar native
  - ✅ Gestion des invitations automatique
  - ✅ Templates d'email riches
  - ✅ Authentification sécurisée

### ✅ **Profils entreprise adaptés**
- **Fichier :** `src/components/ProfileEditModal.jsx`
- **Champs recruteur :** Nom entreprise, secteur d'activité, taille entreprise
- **Industries :** Liste prédéfinie des secteurs

## 🗃️ **Base de données Firestore**

### **Collections essentielles à conserver :**
- `Users` - Profils utilisateurs
- `EmailJSConfig` - Configuration email
- `featured-talents` - Talents mis en avant
- `Jobs` - Offres d'emploi  
- `recommendations` - Recommandations (nouveau format)
- `Messages` - Messages entre utilisateurs

### **Structure recommandation :**
```javascript
{
  jobId: "ID_OFFRE",           // OBLIGATOIRE
  coachId: "ID_COACH", 
  talentId: "ID_TALENT",
  recruiterId: "ID_RECRUTEUR",
  jobTitle: "Titre offre",
  message: "Message coach",
  status: "pending",
  createdAt: new Date(),
  type: "job_recommendation"
}
```

## ⚠️ **Problèmes résolus récemment**

1. **Messagerie :** Erreur `undefined contact.avatarUrl` - Résolu avec null checks
2. **Recommandations :** Boutons incorrects - Résolu avec logique `jobId`
3. **EmailJS :** Non fonctionnel - Réintégré avec configuration dynamique
4. **Syntax error :** `d\'user` - Corrigé en `d\'utilisateur`

## 🔄 **Workflow de développement**

1. **Toujours vérifier les erreurs :** Browser console pour debugging
2. **Redémarrer le serveur :** Si modifications dans services
3. **Tester EmailJS :** Via console admin ou directement dans code
4. **Base de données :** Vérifier les collections avant modifications majeures

## 📧 **Configuration EmailJS**

Variables d'environnement `.env` :
```
VITE_EMAILJS_PUBLIC_KEY=OQMZHyws135U_rpCu
VITE_EMAILJS_SERVICE_ID=service_usnh5hr
```

Ou via Firestore collection `EmailJSConfig` (prioritaire).

## 🚨 **À NE PAS SUPPRIMER**

- `src/pages/ModernMessagesPage.tsx` - Interface messagerie fonctionnelle
- `src/components/SimpleRecommendationModal.tsx` - Système recommandations
- `src/services/emailNotificationService.ts` - Service email (legacy)
- `src/services/googleIntegratedService.ts` - Service Google (NOUVEAU)
- `src/pages/GoogleConfigPage.tsx` - Configuration Google
- `src/pages/TalentRecommendationsPage.tsx` - Affichage recommendations talents
- Collection Firestore `EmailJSConfig` - Configuration email
- Collection Firestore `featured-talents` - Talents mis en avant

## 🔄 **Migration EmailJS → Google**

1. **Accéder à la configuration :** http://127.0.0.1:5173/google-config
2. **Suivre les instructions** pour configurer Google Cloud Console
3. **Tester les fonctionnalités** via l'interface de configuration
4. **Remplacer EmailJS** dans les composants par `googleIntegratedService`

---

**🤖 Généré par Claude Code** - Dernière mise à jour : 2025-09-01