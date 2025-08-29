# Configuration de l'Authentification - TalentConnect

Ce guide vous explique comment configurer et faire fonctionner l'authentification dans vos différents dashboards.

## 🚀 Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre URL et votre clé anonyme

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine de votre projet :

```env
REACT_APP_SUPABASE_URL=votre_url_supabase
REACT_APP_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

### 3. Configurer la base de données

1. Allez dans l'interface Supabase de votre projet
2. Ouvrez l'éditeur SQL
3. Copiez et exécutez le contenu du fichier `supabase_setup.sql`

## 🔧 Fonctionnalités implémentées

### Authentification
- ✅ Inscription avec choix du rôle (Talent, Recruteur, Coach)
- ✅ Connexion avec email/mot de passe
- ✅ Déconnexion
- ✅ Gestion des erreurs d'authentification
- ✅ Messages de succès
- ✅ Redirection automatique selon le rôle

### Protection des routes
- ✅ Routes protégées pour chaque dashboard
- ✅ Redirection automatique si non connecté
- ✅ Redirection vers le bon dashboard selon le rôle
- ✅ Écran de chargement pendant la vérification

### Dashboards
- ✅ **Dashboard Talent** : Gestion du profil, missions, messages
- ✅ **Dashboard Recruteur** : Annonces, candidatures, recherche de talents
- ✅ **Dashboard Coach** : Talents accompagnés, sessions, recommandations

## 🎨 Interface utilisateur

### Design moderne
- Thème sombre avec accent vert (#00d4aa)
- Interface responsive
- Modales élégantes pour l'authentification
- Cartes interactives dans les dashboards

### Expérience utilisateur
- Messages d'erreur clairs et spécifiques
- Messages de succès informatifs
- Boutons avec états de chargement
- Navigation intuitive

## 🔒 Sécurité

### Base de données
- Row Level Security (RLS) activé
- Politiques de sécurité pour chaque opération
- Validation des rôles utilisateur
- Protection contre les accès non autorisés

### Authentification
- Gestion sécurisée des sessions
- Validation des emails
- Protection contre les tentatives de connexion échouées
- Déconnexion automatique

## 🚀 Utilisation

### 1. Démarrer l'application

```bash
npm install
npm start
```

### 2. Tester l'authentification

1. **Inscription** :
   - Cliquez sur "S'inscrire"
   - Choisissez votre rôle (Talent, Recruteur, Coach)
   - Entrez votre email et mot de passe
   - Confirmez votre email (vérifiez vos spams)

2. **Connexion** :
   - Cliquez sur "Se connecter"
   - Entrez vos identifiants
   - Vous serez redirigé vers votre dashboard

3. **Navigation** :
   - Chaque utilisateur accède uniquement à son dashboard
   - La déconnexion vous ramène à la page d'accueil

## 🛠️ Structure du code

### Fichiers principaux
- `src/contexts/AuthContext.tsx` : Gestion de l'authentification
- `src/pages/HomePage.tsx` : Page d'accueil avec modales d'auth
- `src/pages/TalentDashboard.tsx` : Dashboard pour les talents
- `src/pages/RecruiterDashboard.tsx` : Dashboard pour les recruteurs
- `src/pages/CoachDashboard.tsx` : Dashboard pour les coaches
- `src/App.tsx` : Configuration des routes protégées

### Base de données
- Table `profiles` : Stockage des profils utilisateurs
- Triggers automatiques pour la création de profils
- Politiques RLS pour la sécurité

## 🔧 Personnalisation

### Ajouter de nouvelles fonctionnalités
1. Modifiez les dashboards pour ajouter vos fonctionnalités
2. Créez de nouvelles tables dans Supabase si nécessaire
3. Ajoutez les politiques RLS appropriées

### Modifier le design
1. Changez les couleurs dans les fichiers de style
2. Modifiez les composants pour adapter l'interface
3. Ajoutez des animations ou transitions

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de connexion Supabase** :
   - Vérifiez vos variables d'environnement
   - Assurez-vous que votre projet Supabase est actif

2. **Email non confirmé** :
   - Vérifiez vos spams
   - Utilisez un email valide

3. **Redirection incorrecte** :
   - Vérifiez que la table `profiles` est bien configurée
   - Assurez-vous que le rôle est correctement enregistré

4. **Erreurs de base de données** :
   - Exécutez le script SQL de configuration
   - Vérifiez les politiques RLS

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez la console du navigateur pour les erreurs
2. Consultez les logs Supabase
3. Assurez-vous que tous les fichiers sont correctement configurés

---

**TalentConnect** - Connectez les talents, recruteurs et coaches ! 🚀
