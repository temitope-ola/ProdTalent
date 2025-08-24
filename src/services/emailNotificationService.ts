import emailjs from '@emailjs/browser';

// Configuration EmailJS - sera chargée dynamiquement
let EMAILJS_CONFIG = {
  SERVICE_ID: '',
  PUBLIC_KEY: '',
  TEMPLATES: {
    COACHING_RESERVATION: '',
    APPOINTMENT_UPDATE: '',
    NEW_MESSAGE: '',
    NEW_PROFILE: '',
    NEW_APPLICATION: ''
  }
};

// Charger la configuration depuis localStorage
const loadEmailJSConfig = () => {
  try {
    const savedConfig = localStorage.getItem('emailjs_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      EMAILJS_CONFIG = {
        SERVICE_ID: config.serviceId || '',
        PUBLIC_KEY: config.publicKey || '',
        TEMPLATES: {
          COACHING_RESERVATION: config.templates?.coachingReservation || '',
          APPOINTMENT_UPDATE: config.templates?.appointmentUpdate || '',
          NEW_MESSAGE: config.templates?.newMessage || '',
          NEW_PROFILE: config.templates?.newProfile || '',
          NEW_APPLICATION: config.templates?.newApplication || ''
        }
      };
      console.log('✅ Configuration EmailJS chargée:', EMAILJS_CONFIG);
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement de la config EmailJS:', error);
  }
};

export interface EmailNotificationData {
  to_email: string;
  to_name: string;
  from_name?: string;
  from_email?: string;
  subject?: string;
  message?: string;
  appointment_date?: string;
  appointment_time?: string;
  coach_name?: string;
  talent_name?: string;
  recruiter_name?: string;
  job_title?: string;
  profile_url?: string;
}

class EmailNotificationService {
  private isInitialized = false;

  // Initialiser EmailJS
  initialize() {
    if (this.isInitialized) return;
    
    // Charger la configuration
    loadEmailJSConfig();
    
    // Vérifier que la configuration est valide
    if (!EMAILJS_CONFIG.PUBLIC_KEY) {
      console.warn('⚠️ Configuration EmailJS non trouvée. Veuillez configurer EmailJS dans le dashboard coach.');
      return;
    }
    
    // Initialiser EmailJS avec la clé publique
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    this.isInitialized = true;
    console.log('✅ EmailJS initialisé avec succès');
  }

  // Envoyer une notification de réservation de coaching
  async sendCoachingReservation(data: {
    talentEmail: string;
    talentName: string;
    coachName: string;
    date: string;
    time: string;
  }) {
    this.initialize();
    
    // Vérifier que la configuration est complète
    if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.TEMPLATES.COACHING_RESERVATION) {
      console.warn('⚠️ Configuration EmailJS incomplète pour les réservations de coaching');
      return { success: false, error: 'Configuration EmailJS manquante' };
    }
    
    const templateParams = {
      to_email: data.talentEmail,
      to_name: data.talentName,
      coach_name: data.coachName,
      appointment_date: data.date,
      appointment_time: data.time,
      subject: `Réservation confirmée - Coaching avec ${data.coachName}`,
      message: `Votre réservation pour le ${data.date} à ${data.time} avec ${data.coachName} a été confirmée.`
    };

    try {
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATES.COACHING_RESERVATION,
        templateParams
      );
    
      console.log('✅ Email de réservation envoyé:', result);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Erreur envoi email réservation:', message);
    
      return { success: false, error: message };
    }
    
  }

  // Envoyer une notification de mise à jour de rendez-vous
  async sendAppointmentUpdate(data: {
    talentEmail: string;
    talentName: string;
    coachName: string;
    date: string;
    time: string;
    status: 'confirmed' | 'cancelled' | 'rescheduled';
  }) {
    this.initialize();
    
    // Vérifier que la configuration est complète
    if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.TEMPLATES.APPOINTMENT_UPDATE) {
      console.warn('⚠️ Configuration EmailJS incomplète pour les mises à jour de rendez-vous');
      return { success: false, error: 'Configuration EmailJS manquante' };
    }
    
    const statusText = {
      confirmed: 'confirmé',
      cancelled: 'annulé',
      rescheduled: 'reprogrammé'
    };

    const templateParams = {
      to_email: data.talentEmail,
      to_name: data.talentName,
      coach_name: data.coachName,
      appointment_date: data.date,
      appointment_time: data.time,
      status: statusText[data.status],
      subject: `Rendez-vous ${statusText[data.status]} - Coaching`,
      message: `Votre rendez-vous du ${data.date} à ${data.time} avec ${data.coachName} a été ${statusText[data.status]}.`
    };

    try {
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATES.APPOINTMENT_UPDATE,
        templateParams
      );
    
      console.log('✅ Email de mise à jour envoyé:', result);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Erreur envoi email mise à jour:', message);
    
      return { success: false, error: message };
    }
    
  }

  // Envoyer une notification de nouveau message
  async sendNewMessage(data: {
    recipientEmail: string;
    recipientName: string;
    senderName: string;
    senderRole: string;
    messagePreview: string;
  }) {
    this.initialize();
    
    const templateParams = {
      to_email: data.recipientEmail,
      to_name: data.recipientName,
      from_name: data.senderName,
      sender_role: data.senderRole,
      message_preview: data.messagePreview,
      subject: `Nouveau message de ${data.senderName}`,
      message: `Vous avez reçu un nouveau message de ${data.senderName} (${data.senderRole}).`
    };

    try {
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATES.NEW_MESSAGE,
        templateParams
      );
      console.log('✅ Email de nouveau message envoyé:', result);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Erreur envoi email nouveau message:', message);
    
      return { success: false, error: message };
    }
  }

  // Envoyer une notification de nouveau profil talent
  async sendNewProfileNotification(data: {
    recruiterEmails: string[];
    talentName: string;
    talentSkills: string[];
  }) {
    this.initialize();
    
    const templateParams = {
      talent_name: data.talentName,
      talent_skills: data.talentSkills.join(', '),
      subject: `Nouveau talent disponible : ${data.talentName}`,
      message: `Un nouveau talent ${data.talentName} avec les compétences ${data.talentSkills.join(', ')} est maintenant disponible.`
    };

    const results = [];
    
    for (const email of data.recruiterEmails) {
      try {
        const result = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATES.NEW_PROFILE,
          { ...templateParams, to_email: email }
        );
        results.push({ email, success: true });
        console.log(`✅ Email nouveau profil envoyé à ${email}:`, result);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({ email, success: false, error: message });
        console.error(`❌ Erreur envoi email nouveau profil à ${email}:`, message);
      }
    }

    return results;
  }

  // Envoyer une notification de nouvelle candidature
  async sendNewApplication(data: {
    recruiterEmail: string;
    recruiterName: string;
    talentName: string;
    jobTitle: string;
  }) {
    this.initialize();
    
    const templateParams = {
      to_email: data.recruiterEmail,
      to_name: data.recruiterName,
      talent_name: data.talentName,
      job_title: data.jobTitle,
      subject: `Nouvelle candidature pour ${data.jobTitle}`,
      message: `Vous avez reçu une nouvelle candidature de ${data.talentName} pour le poste ${data.jobTitle}.`
    };

    try {
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATES.NEW_APPLICATION,
        templateParams
      );
      console.log('✅ Email de nouvelle candidature envoyé:', result);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Erreur envoi email nouvelle candidature:', message);
    
      return { success: false, error: message };
    }
  }

  // Méthode générique pour tester la configuration
  async testConfiguration() {
    this.initialize();
    
    const testParams = {
      to_email: 'test@example.com',
      to_name: 'Test User',
      subject: 'Test EmailJS',
      message: 'Ceci est un test de configuration EmailJS.'
    };

    try {
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATES.COACHING_RESERVATION,
        testParams
      );
      console.log('✅ Test EmailJS réussi:', result);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Test EmailJS échoué:', message);
    
      return { success: false, error: message };
    }
  }
}

export const emailNotificationService = new EmailNotificationService();
export default emailNotificationService;
