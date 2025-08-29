# 📧 Guide de Configuration EmailJS pour les Notifications

## 🎯 **Objectif**
Configurer EmailJS pour envoyer automatiquement des notifications email pour toutes les communications dans l'application.

## 📋 **Types de Notifications à Configurer**

### 1. **Réservation de Coaching** (Talent → Coach)
- **Déclencheur** : Talent réserve un créneau
- **Destinataire** : Talent (confirmation)
- **Template** : `coaching_reservation`

### 2. **Mise à jour de Rendez-vous** (Coach → Talent)
- **Déclencheur** : Coach confirme/annule un rendez-vous
- **Destinataire** : Talent
- **Template** : `appointment_update`

### 3. **Nouveau Message** (Talent ↔ Recruteur ↔ Coach)
- **Déclencheur** : Envoi d'un message
- **Destinataire** : Destinataire du message
- **Template** : `new_message`

### 4. **Nouveau Profil Talent** (Talent → Recruteurs)
- **Déclencheur** : Talent complète son profil
- **Destinataire** : Tous les recruteurs
- **Template** : `new_profile`

### 5. **Nouvelle Candidature** (Talent → Recruteur)
- **Déclencheur** : Talent postule à une offre
- **Destinataire** : Recruteur
- **Template** : `new_application`

## 🚀 **Étapes de Configuration**

### **Étape 1 : Créer un compte EmailJS**

1. **Aller sur** [https://www.emailjs.com/](https://www.emailjs.com/)
2. **Créer un compte** gratuit (200 emails/mois)
3. **Vérifier votre email** et activer le compte

### **Étape 2 : Configurer un Service Email**

1. **Dans le dashboard EmailJS :**
   - Cliquer sur **"Email Services"**
   - Cliquer sur **"Add New Service"**
   - Choisir **Gmail** (recommandé) ou **Outlook**
   - Suivre les instructions d'authentification
   - **Noter le Service ID** (ex: `service_abc123`)

### **Étape 3 : Créer les Templates Email**

#### **Template 1 : Réservation Coaching**
```
Nom du template : coaching_reservation
Sujet : Réservation confirmée - Coaching avec {{coach_name}}

Contenu :
Bonjour {{to_name}},

Votre réservation de coaching a été confirmée !

📅 Date : {{appointment_date}}
⏰ Heure : {{appointment_time}}
👨‍🏫 Coach : {{coach_name}}

Veuillez vous présenter 5 minutes avant l'heure prévue.

Cordialement,
L'équipe Edacy
```

#### **Template 2 : Mise à jour Rendez-vous**
```
Nom du template : appointment_update
Sujet : Rendez-vous {{status}} - Coaching

Contenu :
Bonjour {{to_name}},

Votre rendez-vous de coaching a été {{status}}.

📅 Date : {{appointment_date}}
⏰ Heure : {{appointment_time}}
👨‍🏫 Coach : {{coach_name}}
📊 Statut : {{status}}

Cordialement,
L'équipe Edacy
```

#### **Template 3 : Nouveau Message**
```
Nom du template : new_message
Sujet : Nouveau message de {{from_name}}

Contenu :
Bonjour {{to_name}},

Vous avez reçu un nouveau message de {{from_name}} ({{sender_role}}).

💬 Aperçu : {{message_preview}}

Connectez-vous à votre dashboard pour lire le message complet.

Cordialement,
L'équipe Edacy
```

#### **Template 4 : Nouveau Profil**
```
Nom du template : new_profile
Sujet : Nouveau talent disponible : {{talent_name}}

Contenu :
Bonjour {{to_name}},

Un nouveau talent est disponible sur la plateforme !

👤 Nom : {{talent_name}}
🛠️ Compétences : {{talent_skills}}

Connectez-vous à votre dashboard pour voir le profil complet.

Cordialement,
L'équipe Edacy
```

#### **Template 5 : Nouvelle Candidature**
```
Nom du template : new_application
Sujet : Nouvelle candidature pour {{job_title}}

Contenu :
Bonjour {{to_name}},

Vous avez reçu une nouvelle candidature !

👤 Candidat : {{talent_name}}
💼 Poste : {{job_title}}

Connectez-vous à votre dashboard pour examiner la candidature.

Cordialement,
L'équipe Edacy
```

### **Étape 4 : Récupérer les IDs**

1. **Public Key** : Dans **Account > API Keys**
2. **Service ID** : Dans **Email Services** (ex: `service_abc123`)
3. **Template IDs** : Dans **Email Templates** (ex: `template_xyz789`)

### **Étape 5 : Configurer dans l'Application**

1. **Aller dans le Dashboard Coach**
2. **Cliquer sur "Configurer EmailJS"**
3. **Remplir les champs :**
   - **Public Key** : Votre clé publique EmailJS
   - **Service ID** : Votre Service ID
   - **Template IDs** : Les 5 IDs de templates
4. **Tester la configuration**
5. **Sauvegarder**

## 🔧 **Intégration dans le Code**

### **Service de Notification Email**
```typescript
// src/services/emailNotificationService.ts
// ✅ Déjà créé et configuré
```

### **Intégration dans les Services**
```typescript
// ✅ Réservations de coaching
// ✅ Mises à jour de rendez-vous
// ⏳ Messages (à implémenter)
// ⏳ Nouveaux profils (à implémenter)
// ⏳ Nouvelles candidatures (à implémenter)
```

## 🧪 **Test de la Configuration**

1. **Dans le Dashboard Coach :**
   - Cliquer sur **"Configurer EmailJS"**
   - Remplir tous les champs
   - Cliquer sur **"Tester"**
   - Vérifier que le test réussit

2. **Test en conditions réelles :**
   - Faire une réservation de coaching
   - Vérifier que l'email est reçu
   - Confirmer/annuler un rendez-vous
   - Vérifier que l'email de mise à jour est reçu

## ⚠️ **Points d'Attention**

### **Limites EmailJS Gratuit**
- **200 emails/mois** maximum
- **1000 emails/mois** en version payante
- **Surveiller l'utilisation** dans le dashboard EmailJS

### **Sécurité**
- **Public Key** : Peut être exposée côté client
- **Service ID** : Peut être exposée côté client
- **Template IDs** : Peut être exposée côté client
- **Pas de données sensibles** dans les templates

### **Performance**
- **Emails asynchrones** : Ne bloquent pas l'interface
- **Gestion d'erreurs** : Logs en cas d'échec
- **Fallback** : Application fonctionne même si EmailJS échoue

## 📊 **Monitoring**

### **Logs à surveiller**
```javascript
// ✅ Email de réservation envoyé
// ✅ Email de mise à jour envoyé
// ❌ Erreur envoi email réservation
// ❌ Erreur envoi email mise à jour
```

### **Dashboard EmailJS**
- **Emails envoyés** : Compteur mensuel
- **Taux de livraison** : Pourcentage de succès
- **Erreurs** : Détails des échecs

## 🎯 **Prochaines Étapes**

1. **✅ Configurer EmailJS** (ce guide)
2. **⏳ Implémenter notifications messages**
3. **⏳ Implémenter notifications nouveaux profils**
4. **⏳ Implémenter notifications candidatures**
5. **⏳ Ajouter templates personnalisés**
6. **⏳ Monitoring avancé**

## 📞 **Support**

- **EmailJS Documentation** : [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- **Support EmailJS** : Via le dashboard
- **Quotas et limites** : Vérifier dans Account > Billing

---

**🎉 Félicitations !** Votre système de notifications email est maintenant configuré et fonctionnel !
