# 🛠️ Mode Développement - Système de Rendez-vous avec Fuseaux Horaires

## ✅ Configuration Automatique

Le système détecte automatiquement quand il tourne en mode développement (`localhost:5173`) et **simule toutes les fonctionnalités Google** pour permettre les tests sans configuration OAuth complexe.

## 🎯 Fonctionnalités Simulées en Développement

### ✅ Google Calendar
- Authentification simulée (pas besoin de Google OAuth)
- Création d'événements simulée
- Liens Meet simulés (`https://meet.google.com/dev-simulation-link`)

### ✅ Gestion des Fuseaux Horaires
- Détection automatique du fuseau horaire local
- Conversion automatique des heures coach ↔ talent
- Affichage correct dans chaque interface

## 🧪 Comment Tester

### 1. Interface Coach - Prise de Rendez-vous
1. Connectez-vous en tant que coach
2. Cliquez sur **"📅 Prise de Rendez-vous"**
3. Sélectionnez une date
4. Activez des créneaux horaires
5. Cliquez sur **"💾 Sauvegarder"**

### 2. Interface Coach - Gestion des Rendez-vous  
1. Cliquez sur **"📋 Mes Rendez-vous"**
2. Voyez les demandes de rendez-vous
3. Testez **"✅ Confirmer"** ou **"❌ Refuser"**
4. Un événement Google Calendar simulé sera "créé"

### 3. Interface Talent - Réservation
1. Accédez à `/book/{coachId}` dans un autre onglet/navigateur
2. Voyez les créneaux du coach convertis dans votre fuseau
3. Remplissez le formulaire
4. Envoyez la demande

## 🔧 Basculement Production

En production (domaines non-localhost), le système utilisera automatiquement :
- Vraie authentification Google OAuth
- Vraie création d'événements Google Calendar
- Vrais liens Google Meet

## 📝 Notes Techniques

- Les messages verts indiquent le mode développement actif
- Tous les logs de simulation sont visibles dans la console
- Les données de disponibilités et rendez-vous sont réelles (Firestore)
- Seules les intégrations Google sont simulées

## ⚠️ Important

Ce mode développement permet de tester **tout le workflow complet** sans avoir besoin de configurer Google OAuth localement. Parfait pour le développement et les tests !