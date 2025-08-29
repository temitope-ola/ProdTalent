# 🚀 ProdTalent - Plateforme de Recrutement Tech

Une plateforme moderne de mise en relation entre talents tech, recruteurs et coaches, construite avec React, TypeScript et Firebase.

## ✨ Fonctionnalités

### 🎯 Pour les Talents
- **Dashboard personnalisé** avec profil complet
- **Agenda de coaching** pour planifier des sessions
- **Candidature aux offres** d'emploi
- **Suivi des applications** et messages
- **Profil professionnel** avec portfolio

### 🏢 Pour les Recruteurs
- **Gestion des offres** d'emploi
- **Consultation des profils** talents
- **Système de candidatures** avancé
- **Messagerie intégrée** avec les talents
- **Statistiques** de recrutement

### 👨‍🏫 Pour les Coaches
- **Dashboard de coaching** complet
- **Gestion des disponibilités** et agenda
- **Suivi des talents** accompagnés
- **Recommandations** aux recruteurs
- **Outils de coaching** intégrés

### 🔧 Administration
- **Gestion des talents mis en avant** sur la page d'accueil
- **Configuration** de la plateforme
- **Statistiques** globales

## 🛠️ Technologies

- **Frontend** : React 18 + TypeScript
- **Build Tool** : Vite
- **Backend** : Firebase (Firestore, Authentication)
- **Styling** : CSS-in-JS (inline styles)
- **Routing** : React Router DOM
- **State Management** : React Context API

## 🚀 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Compte Firebase

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone [URL_DU_REPO]
cd ProdTalent
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Firebase**
   - Créer un projet Firebase
   - Activer Authentication et Firestore
   - Copier la configuration dans `src/firebase.ts`

4. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── Avatar.tsx
│   ├── CoachLogin.tsx
│   ├── CoachAvailabilityManager.tsx
│   ├── FeaturedTalentsManager.tsx
│   ├── ProfileEditModal.tsx
│   └── TalentAgendaView.tsx
├── pages/              # Pages principales
│   ├── HomePage.tsx
│   ├── TalentDashboard.tsx
│   ├── RecruiterDashboard.tsx
│   ├── CoachDashboard.tsx
│   └── ...
├── services/           # Services et API
│   ├── firestoreService.ts
│   └── featuredTalentsService.ts
├── contexts/           # Contextes React
│   └── AuthContext.tsx
├── hooks/              # Hooks personnalisés
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

## 🔐 Authentification

L'application utilise Firebase Authentication avec trois rôles :

- **Talent** : Accès au dashboard talent
- **Recruteur** : Accès au dashboard recruteur  
- **Coach** : Accès au dashboard coach

### Comptes de test

**Coach :**
- Email : `awa@edacy.com`
- Mot de passe : `awa123456`

**Admin :**
- Email : `admin@prodtalent.com`
- Mot de passe : `admin123`

## 🎨 Design System

### Couleurs
- **Primaire** : `#ffcc00` (Jaune)
- **Secondaire** : `#61bfac` (Turquoise)
- **Fond** : `#f5f5f7` (Gris clair)
- **Fond sombre** : `#0a0a0a` (Noir)
- **Cartes** : `#111` (Gris très foncé)

### Typographie
- **Titres** : Gras, couleur jaune
- **Texte** : Blanc sur fond sombre
- **Sous-textes** : Gris clair

## 📱 Pages Principales

### Page d'Accueil (`/`)
- Présentation de la plateforme
- Talents mis en avant (gérés par l'admin)
- Statistiques et chiffres clés
- Navigation vers les dashboards

### Dashboard Talent (`/dashboard/talent`)
- Profil personnel
- Agenda de coaching
- Candidatures aux offres
- Recommandations reçues des coaches
- Messages et notifications

### Dashboard Recruteur (`/dashboard/recruteur`)
- Gestion des offres d'emploi
- Consultation des candidatures
- Recommandations de talents par les coaches
- Messagerie avec les talents
- Statistiques de recrutement

### Dashboard Coach (`/dashboard/coach`)
- Gestion des disponibilités
- Suivi des talents accompagnés
- Recommandations aux recruteurs
- Gestion des rendez-vous
- Outils de coaching

### Administration (`/admin`)
- Gestion des talents mis en avant
- Configuration de la plateforme

## 🔧 Configuration

### Variables d'environnement
Créer un fichier `.env.local` :
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Firestore Collections
- `Talent` : Profils des talents
- `Recruteur` : Profils des recruteurs  
- `Coach` : Profils des coaches
- `featured-talents` : Talents mis en avant
- `jobs` : Offres d'emploi
- `applications` : Candidatures
- `recommendations` : Recommandations des coaches
- `notifications` : Notifications système
- `appointments` : Rendez-vous de coaching
- `availabilities` : Disponibilités des coaches

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Déploiement sur Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**ProdTalent** - Connecter les talents tech avec les meilleures opportunités 🚀



