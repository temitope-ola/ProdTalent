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
    NEW_APPLICATION: '',
    NEW_RECOMMENDATION: '',
    NEW_JOB_POSTING: ''
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
          NEW_APPLICATION: config.templates?.newApplication || '',
          NEW_RECOMMENDATION: config.templates?.newRecommendation || '',
          NEW_JOB_POSTING: config.templates?.newJobPosting || ''
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
  coach_name?: string;
  recommendation_message?: string;
  company_name?: string;
  job_description?: string;
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

  // Envoyer une notification de nouvelle recommandation
  async sendNewRecommendation(data: {
    talentEmail: string;
    talentName: string;
    recruiterEmail: string;
    recruiterName: string;
    coachName: string;
    message: string;
  }) {
    this.initialize();
    
    // Notification au talent
    const talentParams = {
      to_email: data.talentEmail,
      to_name: data.talentName,
      coach_name: data.coachName,
      recruiter_name: data.recruiterName,
      recommendation_message: data.message,
      subject: `Vous avez été recommandé par ${data.coachName}`,
      message: `${data.coachName} vous a recommandé au recruteur ${data.recruiterName}.`
    };

    // Notification au recruteur
    const recruiterParams = {
      to_email: data.recruiterEmail,
      to_name: data.recruiterName,
      coach_name: data.coachName,
      talent_name: data.talentName,
      recommendation_message: data.message,
      subject: `Nouveau talent recommandé par ${data.coachName}`,
      message: `${data.coachName} vous recommande le talent ${data.talentName}.`
    };

    const results = [];
    
    try {
      // Envoyer au talent
      const talentResult = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATES.NEW_RECOMMENDATION,
        talentParams
      );
      results.push({ recipient: 'talent', success: true, result: talentResult });
      console.log('✅ Email de recommandation envoyé au talent:', talentResult);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ recipient: 'talent', success: false, error: message });
      console.error('❌ Erreur envoi email recommandation au talent:', message);
    }
    
    try {
      // Envoyer au recruteur
      const recruiterResult = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATES.NEW_RECOMMENDATION,
        recruiterParams
      );
      results.push({ recipient: 'recruiter', success: true, result: recruiterResult });
      console.log('✅ Email de recommandation envoyé au recruteur:', recruiterResult);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ recipient: 'recruiter', success: false, error: message });
      console.error('❌ Erreur envoi email recommandation au recruteur:', message);
    }

    return results;
  }

  // Envoyer une notification de nouveau poste publié
  async sendNewJobPosting(data: {
    jobTitle: string;
    companyName: string;
    recruiterName: string;
    jobDescription: string;
    talentEmails: string[];
  }) {
    this.initialize();
    
    const templateParams = {
      job_title: data.jobTitle,
      company_name: data.companyName,
      recruiter_name: data.recruiterName,
      job_description: data.jobDescription,
      subject: `Nouvelle offre d'emploi: ${data.jobTitle} chez ${data.companyName}`,
      message: `Une nouvelle offre d'emploi "${data.jobTitle}" a été publiée par ${data.recruiterName} chez ${data.companyName}.`
    };

    const results = [];
    
    for (const email of data.talentEmails) {
      try {
        const result = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATES.NEW_JOB_POSTING,
          { ...templateParams, to_email: email }
        );
        results.push({ email, success: true });
        console.log(`✅ Email nouveau poste envoyé à ${email}:`, result);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({ email, success: false, error: message });
        console.error(`❌ Erreur envoi email nouveau poste à ${email}:`, message);
      }
    }

    return results;
  }

  // Diagnostic complet de la configuration
  async diagnoseConfiguration() {
    const diagnosis = {
      publicKey: !!EMAILJS_CONFIG.PUBLIC_KEY,
      serviceId: !!EMAILJS_CONFIG.SERVICE_ID,
      templates: {
        coaching: !!EMAILJS_CONFIG.TEMPLATES.COACHING_RESERVATION,
        message: !!EMAILJS_CONFIG.TEMPLATES.NEW_MESSAGE,
        recommendation: !!EMAILJS_CONFIG.TEMPLATES.NEW_RECOMMENDATION,
        jobPosting: !!EMAILJS_CONFIG.TEMPLATES.NEW_JOB_POSTING,
        profile: !!EMAILJS_CONFIG.TEMPLATES.NEW_PROFILE,
        application: !!EMAILJS_CONFIG.TEMPLATES.NEW_APPLICATION
      },
      availableTemplate: null as string | null
    };
    
    // Trouver le premier template disponible
    const templates = Object.values(EMAILJS_CONFIG.TEMPLATES);
    diagnosis.availableTemplate = templates.find(t => t && t.trim() !== '') || null;
    
    return diagnosis;
  }

  // Méthode générique pour tester la configuration
  async testConfiguration() {
    this.initialize();
    
    // Vérifier les prérequis
    if (!EMAILJS_CONFIG.PUBLIC_KEY) {
      return { 
        success: false, 
        error: 'PUBLIC_KEY manquante - Veuillez configurer votre clé publique EmailJS' 
      };
    }
    
    if (!EMAILJS_CONFIG.SERVICE_ID) {
      return { 
        success: false, 
        error: 'SERVICE_ID manquant - Veuillez configurer votre service EmailJS' 
      };
    }
    
    // Utiliser un template existant pour le test (prendre le premier disponible)
    let templateToTest = EMAILJS_CONFIG.TEMPLATES.COACHING_RESERVATION || 
                        EMAILJS_CONFIG.TEMPLATES.NEW_MESSAGE || 
                        EMAILJS_CONFIG.TEMPLATES.NEW_RECOMMENDATION ||
                        EMAILJS_CONFIG.TEMPLATES.NEW_JOB_POSTING;
                        
    if (!templateToTest) {
      return { 
        success: false, 
        error: 'Aucun template configuré - Veuillez configurer au moins un template EmailJS' 
      };
    }
    
    const testParams = {
      to_email: 'test@example.com',
      to_name: 'Test User',
      subject: 'Test EmailJS Configuration',
      message: 'Ceci est un test de configuration EmailJS depuis ProdTalent Admin.',
      // Ajout de tous les paramètres possibles pour éviter les erreurs de template
      coach_name: 'Coach Test',
      talent_name: 'Talent Test',
      recruiter_name: 'Recruteur Test',
      appointment_date: new Date().toLocaleDateString('fr-FR'),
      appointment_time: new Date().toLocaleTimeString('fr-FR'),
      job_title: 'Poste Test',
      company_name: 'Entreprise Test',
      recommendation_message: 'Message de test'
    };

    try {
      console.log('🧪 Test EmailJS - Configuration:', {
        serviceId: EMAILJS_CONFIG.SERVICE_ID,
        publicKey: EMAILJS_CONFIG.PUBLIC_KEY ? '✅ Configurée' : '❌ Manquante',
        template: templateToTest
      });
      
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        templateToTest,
        testParams
      );
      
      console.log('✅ Test EmailJS réussi:', result);
      return { 
        success: true, 
        message: 'Test réussi ! EmailJS est correctement configuré.',
        details: result
      };
    } catch (error: any) {
      console.error('❌ Test EmailJS échoué:', error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = 'Erreur inconnue';
      
      if (error.text) {
        // EmailJS renvoie souvent l'erreur dans error.text
        errorMessage = error.text;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Messages d'erreur spécifiques selon le type d'erreur
      if (errorMessage.includes('Invalid service ID')) {
        errorMessage = 'SERVICE_ID invalide - Vérifiez votre ID de service EmailJS';
      } else if (errorMessage.includes('Invalid template ID')) {
        errorMessage = 'TEMPLATE_ID invalide - Vérifiez votre ID de template EmailJS';
      } else if (errorMessage.includes('Invalid public key')) {
        errorMessage = 'PUBLIC_KEY invalide - Vérifiez votre clé publique EmailJS';
      } else if (errorMessage.includes('blocked') || errorMessage.includes('CORS')) {
        errorMessage = 'Erreur CORS - Ajoutez votre domaine dans les paramètres EmailJS';
      } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        errorMessage = 'Quota EmailJS dépassé - Vérifiez votre limite mensuelle';
      } else if (errorMessage.includes('Network')) {
        errorMessage = 'Erreur réseau - Vérifiez votre connexion internet';
      }
    
      return { 
        success: false, 
        error: errorMessage,
        originalError: error
      };
    }
  }
}

export const emailNotificationService = new EmailNotificationService();
export default emailNotificationService;
