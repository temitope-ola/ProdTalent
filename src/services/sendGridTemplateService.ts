/**
 * Service SendGrid avec Templates Dynamiques
 * Utilise vos templates SendGrid au lieu du HTML intégré
 */

interface TemplateEmailData {
  to: string;
  templateId: string;
  dynamicTemplateData: Record<string, any>;
  from?: string;
}

interface JobNotificationData {
  recipientEmail: string;
  recipientName: string;
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  contractType: string;
  jobDescription?: string;
}

interface ApplicationNotificationData {
  recipientEmail: string;
  recipientName: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  applicationDate: string;
}

interface AppointmentNotificationData {
  recipientEmail: string;
  recipientName: string;
  coachName: string;
  appointmentDate: string;
  appointmentTime: string;
  meetingType: string;
  meetLink?: string;
  calendarLink?: string;
}

interface MessageNotificationData {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderRole: string;
  messagePreview: string;
}

interface ProfileNotificationData {
  recipientEmail: string;
  recipientName: string;
  talentName: string;
  talentSkills: string;
  talentExperience: string;
}

interface WelcomeNotificationData {
  recipientEmail: string;
  recipientName: string;
  userRole: 'Talent' | 'Recruteur' | 'Coach';
  dashboardUrl: string;
}

class SendGridTemplateService {
  // Template IDs de vos templates SendGrid
  private readonly TEMPLATES = {
    NEW_JOB: 'd-0cd03582b38a406da76f2b71e0481d9d',
    NEW_APPLICATION: 'd-6506536d39c1457fa6b5408c16d226dc',
    APPLICATION_SENT: 'd-fe05810a24a440bca3b44b4740ee797d',
    APPOINTMENT_CONFIRMATION: 'd-488f0d2aab2845369229ad2319fc868f',
    NEW_APPOINTMENT: 'd-ac4aade4451646df9fd0e9f24a1eb054',
    NEW_MESSAGE: 'd-ce52fb56dcdd4ebf8977553881e1f80c',
    NEW_PROFILE: 'd-f5f8e405aa0a409aace81ae661488b50',
    WELCOME: 'd-fa1de9a468f448a9a34f393134468b1e',
  };

  private readonly FROM_EMAIL = 'admin@prodtalent.com';

  async sendTemplateEmail(data: TemplateEmailData): Promise<boolean> {
    try {
      const apiKey = import.meta.env.VITE_SENDGRID_API_KEY || localStorage.getItem('SENDGRID_API_KEY') || '';
      
      if (!apiKey) {
        console.error('❌ Clé API SendGrid manquante');
        return false;
      }

      console.log('📧 Envoi template SendGrid:', data.templateId, 'vers:', data.to);
      console.log('🔍 Données à envoyer:', data.dynamicTemplateData);

      // Utiliser notre backend pour éviter CORS
      const response = await fetch('http://localhost:3000/api/sendgrid/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: apiKey,
          to: data.to,
          from: data.from || this.FROM_EMAIL,
          templateId: data.templateId,
          dynamicTemplateData: data.dynamicTemplateData
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Template email SendGrid envoyé avec succès');
        return true;
      } else {
        console.error('❌ Erreur SendGrid template:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur envoi template SendGrid:', error);
      return false;
    }
  }

  async sendJobNotification(data: JobNotificationData): Promise<boolean> {
    return this.sendTemplateEmail({
      to: data.recipientEmail,
      templateId: this.TEMPLATES.NEW_JOB,
      dynamicTemplateData: {
        talent_name: data.recipientName,
        job_title: data.jobTitle,
        company_name: data.companyName,
        job_location: data.jobLocation,
        job_type: data.contractType,
        job_description: data.jobDescription || '',
        cta_url: 'https://prodtalent.com/jobs',
        platform_name: 'ProdTalent'
      }
    });
  }

  async sendApplicationNotification(data: ApplicationNotificationData): Promise<boolean> {
    return this.sendTemplateEmail({
      to: data.recipientEmail,
      templateId: this.TEMPLATES.NEW_APPLICATION,
      dynamicTemplateData: {
        recruiter_name: data.recipientName,
        applicant_name: data.applicantName,
        job_title: data.jobTitle,
        company_name: data.companyName,
        application_date: data.applicationDate,
        cta_url: 'https://prodtalent.com/applications',
        platform_name: 'ProdTalent'
      }
    });
  }

  async sendAppointmentConfirmation(data: AppointmentNotificationData): Promise<boolean> {
    // Détecter si c'est pour le coach (meetingType contient le nom du talent)
    const isForCoach = data.meetingType.includes('avec ');
    const displayName = isForCoach ? data.recipientName : data.coachName;
    
    return this.sendTemplateEmail({
      to: data.recipientEmail,
      templateId: this.TEMPLATES.APPOINTMENT_CONFIRMATION,
      dynamicTemplateData: {
        coach_name: displayName, // Nom qui apparaîtra dans "avec {{coach_name}}"
        status: 'confirmé',
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        appointment_type: data.meetingType,
        details_url: 'https://prodtalent.com/dashboard',
        meet_link: data.meetLink || '',
        calendar_link: data.calendarLink || '',
        platform_name: 'ProdTalent'
      }
    });
  }

  async sendNewAppointment(data: AppointmentNotificationData): Promise<boolean> {
    return this.sendTemplateEmail({
      to: data.recipientEmail,
      templateId: this.TEMPLATES.NEW_APPOINTMENT,
      dynamicTemplateData: {
        talent_name: data.recipientName,
        coach_name: data.coachName,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        meeting_type: data.meetingType,
        meet_link: data.meetLink || '',
        calendar_link: data.calendarLink || '',
        platform_name: 'ProdTalent'
      }
    });
  }

  async sendMessageNotification(data: MessageNotificationData): Promise<boolean> {
    return this.sendTemplateEmail({
      to: data.recipientEmail,
      templateId: this.TEMPLATES.NEW_MESSAGE,
      dynamicTemplateData: {
        recipient_name: data.recipientName,
        sender_name: data.senderName,
        sender_role: data.senderRole,
        message_preview: data.messagePreview,
        cta_url: 'https://prodtalent.com/messages',
        platform_name: 'ProdTalent'
      }
    });
  }

  async sendProfileNotification(data: ProfileNotificationData): Promise<boolean> {
    return this.sendTemplateEmail({
      to: data.recipientEmail,
      templateId: this.TEMPLATES.NEW_PROFILE,
      dynamicTemplateData: {
        recruiter_name: data.recipientName,
        talent_name: data.talentName,
        talent_skills: data.talentSkills,
        talent_experience: data.talentExperience,
        cta_url: 'https://prodtalent.com/talents',
        platform_name: 'ProdTalent'
      }
    });
  }

  async sendWelcomeEmail(data: WelcomeNotificationData): Promise<boolean> {
    return this.sendTemplateEmail({
      to: data.recipientEmail,
      templateId: this.TEMPLATES.WELCOME,
      dynamicTemplateData: {
        user_name: data.recipientName,
        user_role: data.userRole,
        dashboard_url: data.dashboardUrl,
        platform_name: 'ProdTalent'
      }
    });
  }

  async sendApplicationSentConfirmation(data: {
    recipientEmail: string;
    recipientName: string;
    jobTitle: string;
    companyName: string;
    applicationDate: string;
  }): Promise<boolean> {
    return this.sendTemplateEmail({
      to: data.recipientEmail,
      templateId: this.TEMPLATES.APPLICATION_SENT,
      dynamicTemplateData: {
        talent_name: data.recipientName,
        job_title: data.jobTitle,
        company_name: data.companyName,
        application_date: data.applicationDate,
        dashboard_url: 'https://prodtalent.com/dashboard/talent',
        jobs_url: 'https://prodtalent.com/jobs',
        platform_name: 'ProdTalent'
      }
    });
  }

  // Méthode pour tester un template avec des données factices
  async testTemplate(templateType: 'job' | 'application' | 'appointment_confirmation' | 'new_appointment' | 'message' | 'profile' | 'welcome'): Promise<boolean> {
    const testData = {
      job: {
        recipientEmail: 'france1ola@gmail.com',
        recipientName: 'John Doe',
        jobTitle: 'Développeur Full-Stack',
        companyName: 'TechCorp',
        jobLocation: 'Paris, France',
        contractType: 'CDI',
        jobDescription: 'Poste passionnant dans une startup en croissance'
      },
      application: {
        recipientEmail: 'france1ola@gmail.com',
        recipientName: 'Marie Dupont',
        applicantName: 'Pierre Martin',
        jobTitle: 'Développeur React',
        companyName: 'InnoTech',
        applicationDate: new Date().toLocaleDateString('fr-FR')
      },
      appointment_confirmation: {
        recipientEmail: 'france1ola@gmail.com',
        recipientName: 'Alice Johnson',
        coachName: 'Coach Sarah',
        appointmentDate: '15 septembre 2025',
        appointmentTime: '14:30',
        meetingType: 'Session de coaching carrière',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        calendarLink: 'https://calendar.google.com/event?eid=test'
      },
      new_appointment: {
        recipientEmail: 'france1ola@gmail.com',
        recipientName: 'Bob Wilson',
        coachName: 'Coach Emma',
        appointmentDate: '20 septembre 2025',
        appointmentTime: '16:00',
        meetingType: 'Préparation entretien',
        meetLink: 'https://meet.google.com/xyz-uvwx-abc',
        calendarLink: 'https://calendar.google.com/event?eid=test2'
      },
      message: {
        recipientEmail: 'france1ola@gmail.com',
        recipientName: 'Charlie Brown',
        senderName: 'Entreprise TechStart',
        senderRole: 'Recruteur',
        messagePreview: 'Votre profil nous intéresse beaucoup pour notre poste de Lead Developer...'
      },
      profile: {
        recipientEmail: 'france1ola@gmail.com',
        recipientName: 'Diana Prince',
        talentName: 'Alex Martin',
        talentSkills: 'React, Node.js, TypeScript, AWS',
        talentExperience: '5 ans en développement full-stack'
      },
      welcome: {
        recipientEmail: 'france1ola@gmail.com',
        recipientName: 'France',
        userRole: 'Talent' as 'Talent' | 'Recruteur' | 'Coach',
        dashboardUrl: 'https://prodtalent.com/dashboard/talent'
      }
    };

    switch (templateType) {
      case 'job':
        return this.sendJobNotification(testData.job);
      case 'application':
        return this.sendApplicationNotification(testData.application);
      case 'appointment_confirmation':
        return this.sendAppointmentConfirmation(testData.appointment_confirmation);
      case 'new_appointment':
        return this.sendNewAppointment(testData.new_appointment);
      case 'message':
        return this.sendMessageNotification(testData.message);
      case 'profile':
        return this.sendProfileNotification(testData.profile);
      case 'welcome':
        return this.sendWelcomeEmail(testData.welcome);
      default:
        console.error('Type de template non reconnu:', templateType);
        return false;
    }
  }
}

export const sendGridTemplateService = new SendGridTemplateService();
export default sendGridTemplateService;